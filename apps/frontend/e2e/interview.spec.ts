import { test, expect } from '@playwright/test';

test.describe('InterviewOS Candidate Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Authentication
    await page.route('**/api/v1/auth/me', async route => {
      const json = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'candidate@example.com',
        full_name: 'Test Candidate',
        role: 'candidate',
        is_verified: true,
      };
      await route.fulfill({ json });
    });

    // Mock Dashboard Stats
    await page.route('**/api/v1/dashboard/overview', async route => {
      const json = {
        stats: {
          level: 3,
          xp: 1500,
          interview_streak: 5,
          readiness_score: 80,
          coding_progress: 60,
        },
        recent_activity: [],
        notifications: [],
        daily_goals: []
      };
      await route.fulfill({ json });
    });
  });

  test('should navigate to dashboard and start interview', async ({ page }) => {
    // Navigate directly to dashboard (assuming protected route checks /auth/me)
    await page.goto('/dashboard');
    
    // Check if dashboard loaded properly (checking for known text or headers)
    await expect(page.getByText('Command Center')).toBeVisible();

    // Navigate to Resume upload page
    await page.goto('/resume');

    // Mock the Resume Upload
    await page.route('**/api/v1/resume/upload', async route => {
      const json = {
        id: '987fcdeb-51a2-43d7-9012-345678901234',
        parsing_status: 'completed',
        message: 'Resume uploaded successfully'
      };
      await route.fulfill({ status: 202, json });
    });

    // Verify the UI exists.
    await expect(page.getByText('Resume Upload Protocol')).toBeVisible();

    // Mock the Resume Fetch for the Interview Setup Page
    await page.route('**/api/v1/resume', async route => {
      const json = [
        {
          id: '987fcdeb-51a2-43d7-9012-345678901234',
          user_id: '123e4567-e89b-12d3-a456-426614174000',
          parsing_status: 'completed'
        }
      ];
      await route.fulfill({ status: 200, json });
    });

    // Navigate to Interview setup
    await page.goto('/interview');

    // Mock the Interview Start API
    await page.route('**/api/v1/interview/start', async route => {
      const json = {
        id: 'session-uuid-1234',
        status: 'in_progress',
        target_company: 'Google',
        message: 'Interview session created successfully.'
      };
      await route.fulfill({ status: 201, json });
    });
    
    // In a full E2E, we'd fill the form and click start.
    // For now, we verify the setup page renders correctly.
    await expect(page.getByRole('button', { name: /Start Interview/i })).toBeVisible();
  });
});
