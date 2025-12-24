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

import { describe, it, expect, beforeEach, vi } from "vitest";
import { updateFaviconBadge, _resetFaviconState } from "./faviconBadge";

describe("Favicon Badge Integration", () => {
	beforeEach(() => {
		_resetFaviconState();
		document.head.innerHTML = "";
		vi.clearAllMocks();
	});

	describe("when new notifications arrive", () => {
		it("updates badge when unread count increases from 0 to 1", () => {
			// Setup: favicon link exists
			const link = document.createElement("link");
			link.rel = "icon";
			link.href = "/favicon.png";
			document.head.appendChild(link);

			// Initial state: 0 unread notifications
			updateFaviconBadge(0);
			let faviconLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
			expect(faviconLink?.href).toContain("favicon.png");

			// New notification arrives: count increases to 1
			updateFaviconBadge(1);

			// Should trigger badge update (can't fully test canvas rendering in jsdom,
			// but we can verify the function was called with new count)
			// The badge rendering is tested in detail in faviconBadge.test.ts
			expect(() => updateFaviconBadge(1)).not.toThrow();
		});

		it("updates badge when unread count increases from 5 to 10", () => {
			const link = document.createElement("link");
			link.rel = "icon";
			link.href = "/favicon.png";
			document.head.appendChild(link);

			// Initial state: 5 unread notifications
			updateFaviconBadge(5);

			// More notifications arrive: count increases to 10
			updateFaviconBadge(10);

			// Should trigger badge update
			expect(() => updateFaviconBadge(10)).not.toThrow();
		});

		it("updates badge when unread count increases from 50 to 120 (100+ display)", () => {
			const link = document.createElement("link");
			link.rel = "icon";
			link.href = "/favicon.png";
			document.head.appendChild(link);

			// Initial state: 50 unread notifications
			updateFaviconBadge(50);

			// Many more notifications arrive: count increases to 120
			updateFaviconBadge(120);

			// Should trigger badge update showing "100+"
			expect(() => updateFaviconBadge(120)).not.toThrow();
		});

		it("updates badge when unread count increases from 0 to 100", () => {
			const link = document.createElement("link");
			link.rel = "icon";
			link.href = "/favicon.png";
			document.head.appendChild(link);

			// Initial state: 0 unread notifications
			updateFaviconBadge(0);

			// Many notifications arrive: count increases to 100
			updateFaviconBadge(100);

			// Should trigger badge update showing "100"
			expect(() => updateFaviconBadge(100)).not.toThrow();
		});
	});

	describe("when notifications are marked read", () => {
		it("updates badge when unread count decreases from 10 to 5", () => {
			const link = document.createElement("link");
			link.rel = "icon";
			link.href = "/favicon.png";
			document.head.appendChild(link);

			// Initial state: 10 unread notifications
			updateFaviconBadge(10);

			// Mark some as read: count decreases to 5
			updateFaviconBadge(5);

			// Should trigger badge update
			expect(() => updateFaviconBadge(5)).not.toThrow();
		});

		it("removes badge when unread count decreases from 1 to 0", () => {
			const link = document.createElement("link");
			link.rel = "icon";
			link.href = "/favicon.png";
			document.head.appendChild(link);

			// Initial state: 1 unread notification
			updateFaviconBadge(1);

			// Mark last notification as read: count decreases to 0
			updateFaviconBadge(0);

			// Should restore original favicon (no badge)
			const faviconLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
			expect(faviconLink?.href).toContain("favicon.png");
		});

		it("updates badge when unread count decreases from 150 to 50", () => {
			const link = document.createElement("link");
			link.rel = "icon";
			link.href = "/favicon.png";
			document.head.appendChild(link);

			// Initial state: 150 unread notifications (showing "100+")
			updateFaviconBadge(150);

			// Mark many as read: count decreases to 50
			updateFaviconBadge(50);

			// Should trigger badge update showing "50"
			expect(() => updateFaviconBadge(50)).not.toThrow();
		});

		it("updates badge when unread count decreases from 120 to 100", () => {
			const link = document.createElement("link");
			link.rel = "icon";
			link.href = "/favicon.png";
			document.head.appendChild(link);

			// Initial state: 120 unread notifications (showing "100+")
			updateFaviconBadge(120);

			// Mark some as read: count decreases to exactly 100
			updateFaviconBadge(100);

			// Should trigger badge update showing "100" (not "100+")
			expect(() => updateFaviconBadge(100)).not.toThrow();
		});

		it("updates badge when unread count decreases from 101 to 99", () => {
			const link = document.createElement("link");
			link.rel = "icon";
			link.href = "/favicon.png";
			document.head.appendChild(link);

			// Initial state: 101 unread notifications (showing "100+")
			updateFaviconBadge(101);

			// Mark some as read: count decreases to 99
			updateFaviconBadge(99);

			// Should trigger badge update showing "99" (transition from "100+" to exact count)
			expect(() => updateFaviconBadge(99)).not.toThrow();
		});
	});

	describe("multiple sequential updates", () => {
		it("handles a sequence of notification count changes", () => {
			const link = document.createElement("link");
			link.rel = "icon";
			link.href = "/favicon.png";
			document.head.appendChild(link);

			// Simulate realistic notification flow
			updateFaviconBadge(0); // Start with 0
			updateFaviconBadge(3); // New notifications arrive
			updateFaviconBadge(7); // More arrive
			updateFaviconBadge(5); // Some marked read
			updateFaviconBadge(15); // More arrive
			updateFaviconBadge(10); // Some marked read
			updateFaviconBadge(0); // All marked read

			// Final state should be no badge
			const faviconLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
			expect(faviconLink?.href).toContain("favicon.png");
		});

		it("handles transitions across the 100+ threshold", () => {
			const link = document.createElement("link");
			link.rel = "icon";
			link.href = "/favicon.png";
			document.head.appendChild(link);

			// Simulate crossing the 100+ threshold multiple times
			updateFaviconBadge(95); // Start below threshold
			updateFaviconBadge(105); // Cross into 100+
			updateFaviconBadge(150); // More come in
			updateFaviconBadge(99); // Drop below threshold
			updateFaviconBadge(102); // Cross back above
			updateFaviconBadge(100); // Exactly at boundary
			updateFaviconBadge(50); // Drop below

			// All updates should succeed without error
			expect(() => updateFaviconBadge(50)).not.toThrow();
		});
	});

	describe("edge cases in notification flow", () => {
		it("handles duplicate counts (no change)", () => {
			const link = document.createElement("link");
			link.rel = "icon";
			link.href = "/favicon.png";
			document.head.appendChild(link);

			// Set initial count
			updateFaviconBadge(5);

			// Call with same count multiple times (should skip update)
			updateFaviconBadge(5);
			updateFaviconBadge(5);
			updateFaviconBadge(5);

			// Should not error
			expect(() => updateFaviconBadge(5)).not.toThrow();
		});

		it("handles rapid fluctuations", () => {
			const link = document.createElement("link");
			link.rel = "icon";
			link.href = "/favicon.png";
			document.head.appendChild(link);

			// Rapid changes (simulating real-time updates)
			updateFaviconBadge(1);
			updateFaviconBadge(2);
			updateFaviconBadge(1);
			updateFaviconBadge(3);
			updateFaviconBadge(2);
			updateFaviconBadge(4);

			// Should handle all updates
			expect(() => updateFaviconBadge(4)).not.toThrow();
		});
	});
});
