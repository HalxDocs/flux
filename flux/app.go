package main

import (
	"context"
	"errors"
	"sync"

	"github.com/google/uuid"
	"github.com/wailsapp/wails/v2/pkg/runtime"

	"flux/internal/collections"
	"flux/internal/environments"
	"flux/internal/history"
	"flux/internal/models"
	"flux/internal/postman"
	"flux/internal/profile"
	"flux/internal/requester"
	"flux/internal/storage"
)

type App struct {
	ctx          context.Context
	collections  *collections.Store
	history      *history.Store
	environments *environments.Store
	profile      *profile.Store

	// inflight tracks the currently executing SendRequest's cancel func, so
	// CancelRequest from the UI can abort it. Phase 1 supports one in-flight
	// request at a time; concurrency is a Phase 2+ concern.
	mu       sync.Mutex
	inflight context.CancelFunc
}

func NewApp() *App {
	return &App{
		collections:  collections.NewStore(),
		history:      history.NewStore(),
		environments: environments.NewStore(),
		profile:      profile.NewStore(),
	}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	_ = a.profile.MarkLaunch()
}

// SendRequest executes an HTTP request and persists a history entry. The
// request runs under a cancellable context; CancelRequest aborts it.
func (a *App) SendRequest(payload models.RequestPayload) models.ResponseResult {
	ctx, cancel := context.WithCancel(context.Background())

	a.mu.Lock()
	// Cancel any prior in-flight request before starting a new one.
	if a.inflight != nil {
		a.inflight()
	}
	a.inflight = cancel
	a.mu.Unlock()

	result := requester.Execute(ctx, payload)

	a.mu.Lock()
	if a.inflight != nil {
		// Already cleared if CancelRequest ran first; otherwise clean up.
		a.inflight = nil
	}
	a.mu.Unlock()
	cancel()

	_ = a.history.Append(payload, result)
	if result.Error == "" {
		_ = a.profile.IncrementRequestCount()
	}
	return result
}

// CancelRequest aborts the most recent in-flight SendRequest (if any).
// Safe to call when no request is in flight.
func (a *App) CancelRequest() {
	a.mu.Lock()
	defer a.mu.Unlock()
	if a.inflight != nil {
		a.inflight()
		a.inflight = nil
	}
}

// --- Collections ---

func (a *App) GetCollections() ([]models.Collection, error) {
	return a.collections.GetAll()
}

func (a *App) CreateCollection(name string) (models.Collection, error) {
	return a.collections.CreateCollection(name)
}

func (a *App) RenameCollection(id, name string) error {
	return a.collections.RenameCollection(id, name)
}

func (a *App) DeleteCollection(id string) error {
	return a.collections.DeleteCollection(id)
}

func (a *App) AddRequestToCollection(collID, name string, payload models.RequestPayload) (models.SavedRequest, error) {
	return a.collections.AddRequest(collID, name, payload)
}

func (a *App) UpdateSavedRequest(reqID, name string, payload models.RequestPayload) error {
	return a.collections.UpdateRequest(reqID, name, payload)
}

func (a *App) DeleteSavedRequest(reqID string) error {
	return a.collections.DeleteRequest(reqID)
}

// --- History ---

func (a *App) GetHistory() ([]models.HistoryEntry, error) {
	return a.history.GetAll()
}

func (a *App) ClearHistory() error {
	return a.history.Clear()
}

// --- Environments ---

func (a *App) GetEnvironments() (environments.Snapshot, error) {
	return a.environments.Get()
}

func (a *App) CreateEnvironment(name string) (models.Environment, error) {
	return a.environments.Create(name)
}

func (a *App) UpdateEnvironment(id, name string, vars []models.EnvVar) error {
	return a.environments.Update(id, name, vars)
}

func (a *App) DeleteEnvironment(id string) error {
	return a.environments.Delete(id)
}

func (a *App) SetActiveEnvironment(id string) error {
	return a.environments.SetActive(id)
}

// --- Postman import ---

// ImportPostman parses a Postman v2.1 collection JSON document and appends
// every request to the target collection. The user picks `target` in the UI;
// on the Go side we trust it has been verified to exist.
func (a *App) ImportPostman(targetCollID, jsonData string) (int, error) {
	if targetCollID == "" {
		return 0, errors.New("target collection is required")
	}
	requests, err := postman.Parse([]byte(jsonData), targetCollID)
	if err != nil {
		return 0, err
	}
	for _, r := range requests {
		// Each request gets its own ID assigned by Parse; trust it.
		_ = r.ID
		if _, err := a.collections.AddRequest(targetCollID, r.Name, r.Payload); err != nil {
			return 0, err
		}
	}
	return len(requests), nil
}

// --- Native dialogs ---

// PickFile opens a native file picker and returns the chosen file path. The
// frontend then reads the file via FetchFileBytes / Wails runtime.
func (a *App) PickFile(title string, filter string) (string, error) {
	if a.ctx == nil {
		return "", errors.New("app context not ready")
	}
	options := runtime.OpenDialogOptions{Title: title}
	if filter != "" {
		options.Filters = []runtime.FileFilter{{DisplayName: "JSON", Pattern: filter}}
	}
	return runtime.OpenFileDialog(a.ctx, options)
}

// ReadFileText reads the file at path and returns its UTF-8 contents.
func (a *App) ReadFileText(path string) (string, error) {
	if path == "" {
		return "", errors.New("path is required")
	}
	data, err := readFile(path)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

// --- Profile ---

func (a *App) GetProfile() (profile.Profile, error) {
	return a.profile.Get()
}

func (a *App) UpdateProfile(name, email string) error {
	return a.profile.Update(name, email)
}

// AppDataDir returns the absolute path to the directory where Flux stores
// collections, environments, history, and profile JSON. Used by the Settings
// page so users know where their data lives.
func (a *App) AppDataDir() (string, error) {
	return storage.AppDir()
}

// nudge the linter — uuid stays in the import set even when only used by
// transitively-called subpackages so the binding generator picks it up.
var _ = uuid.NewString
