// Copyright (C) 2025 Austin Beattie
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

// Package helpers provides shared utilities for the API.
package helpers

import (
	"encoding/json"
	"net/http"
)

// errorResponse is the response type for an error.
type errorResponse struct {
	Error string `json:"error"`
}

// WriteJSON writes a JSON response to the response writer.
func WriteJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	if value == nil {
		return
	}

	if err := json.NewEncoder(w).Encode(value); err != nil {
		// The status code has already been written. Best effort attempt to transmit the error.
		// Ignoring write error as we can't change the response status at this point.
		if _, writeErr := w.Write([]byte(`{"error":"failed to encode response"}`)); writeErr != nil {
			// Log the error if we have a logger, but we can't return it here
			_ = writeErr
		}
	}
}

// WriteError writes an error response to the response writer.
func WriteError(w http.ResponseWriter, status int, msg string) {
	WriteJSON(w, status, errorResponse{Error: msg})
}
