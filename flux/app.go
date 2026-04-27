package main

import (
	"context"

	"flux/internal/collections"
	"flux/internal/history"
	"flux/internal/models"
	"flux/internal/requester"
)

type App struct {
	ctx         context.Context
	collections *collections.Store
	history     *history.Store
}

func NewApp() *App {
	return &App{
		collections: collections.NewStore(),
		history:     history.NewStore(),
	}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// SendRequest executes an HTTP request and persists a history entry.
func (a *App) SendRequest(payload models.RequestPayload) models.ResponseResult {
	result := requester.Execute(payload)
	// Best-effort history write; a failure here should not bubble up to the user.
	_ = a.history.Append(payload, result)
	return result
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
