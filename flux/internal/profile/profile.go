// Package profile persists a single local user identity to profile.json in
// the Flux app data dir. There is no auth, no remote — just enough to remember
// who's been using the app, when they first launched, and how many requests
// they've fired so the UI can show personalized state.
package profile

import (
	"sync"
	"time"

	"github.com/google/uuid"

	"flux/internal/storage"
)

const fileName = "profile.json"

type Profile struct {
	UserID       string `json:"userId"`
	Name         string `json:"name"`
	Email        string `json:"email"`
	CreatedAt    string `json:"createdAt"`
	LastSeenAt   string `json:"lastSeenAt"`
	LaunchCount  int    `json:"launchCount"`
	RequestCount int    `json:"requestCount"`
}

type Store struct {
	mu      sync.Mutex
	profile *Profile
	loaded  bool
}

func NewStore() *Store { return &Store{} }

func (s *Store) load() error {
	if s.loaded {
		return nil
	}
	p := &Profile{}
	if err := storage.Load(fileName, p); err != nil {
		return err
	}
	if p.UserID == "" {
		// First launch — mint identity but leave name/email blank for the
		// welcome modal to fill in.
		now := time.Now().UTC().Format(time.RFC3339)
		p = &Profile{
			UserID:      uuid.NewString(),
			CreatedAt:   now,
			LastSeenAt:  now,
			LaunchCount: 1,
		}
		if err := storage.Save(fileName, p); err != nil {
			return err
		}
	}
	s.profile = p
	s.loaded = true
	return nil
}

// Get returns the current profile, creating a fresh one if this is the first
// launch.
func (s *Store) Get() (Profile, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if err := s.load(); err != nil {
		return Profile{}, err
	}
	return *s.profile, nil
}

// MarkLaunch bumps the launch count and updates LastSeenAt. Called once at
// startup.
func (s *Store) MarkLaunch() error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if err := s.load(); err != nil {
		return err
	}
	s.profile.LaunchCount++
	s.profile.LastSeenAt = time.Now().UTC().Format(time.RFC3339)
	return storage.Save(fileName, s.profile)
}

// IncrementRequestCount is called after every successful SendRequest so the
// Settings page can show a running total.
func (s *Store) IncrementRequestCount() error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if err := s.load(); err != nil {
		return err
	}
	s.profile.RequestCount++
	s.profile.LastSeenAt = time.Now().UTC().Format(time.RFC3339)
	return storage.Save(fileName, s.profile)
}

// Update overwrites the user-visible fields (name, email). Identity, counts,
// and timestamps are preserved.
func (s *Store) Update(name, email string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if err := s.load(); err != nil {
		return err
	}
	s.profile.Name = name
	s.profile.Email = email
	return storage.Save(fileName, s.profile)
}
