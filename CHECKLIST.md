# TaskDesk Feature Checklist

A full checklist of every feature verified against the running app.

## Authentication

- [x] Signup page accepts name, email and password and creates an account
- [x] Signing up with an already-registered email shows an error
- [x] Login with valid credentials signs the user in and redirects to the dashboard
- [x] Login with wrong credentials shows an error message
- [x] A JWT is issued on login and stored as an httpOnly cookie
- [x] Visiting a protected route while logged out redirects to the login page
- [x] Logout clears the session and redirects to the login page
- [x] The logged-in user's name and email show in the top bar on every relevant page

## Dashboard Page (open the app)

- [x] Projects section shows projects as cards with name and description
- [x] Projects are paginated (9 per page) with the page number in the URL
- [x] Clicking a project card opens that project's management screen
- [x] Tasks section shows tasks as cards with status, priority, owners and tags
- [x] Status filter narrows the task list to the selected status
- [x] All Tasks / My Tasks toggle switches between every task and the logged-in user's tasks
- [x] My Tasks filters tasks to those the current user owns (owner=user id)
- [x] Task pagination and the active filter are reflected in the URL
- [x] Refreshing the page preserves the active filter, toggle and page
- [x] Clicking a task card opens its detail page
- [x] Sidebar: Dashboard, Project, Team, Reports and Settings links all navigate correctly
- [x] Sidebar links can be opened in a new tab (real anchors)

## Projects Page (click Project from sidebar)

- [x] All projects are listed as cards, paginated with the page in the URL
- [x] New Project button opens the create-project modal
- [x] Creating a project with a duplicate name shows an error
- [x] Each project card has a menu to edit or delete the project
- [x] Editing a project updates its name and description
- [x] Deleting a project asks for confirmation before removing it
- [x] Clicking a project opens its project management screen

## Project Management Screen (click any project)

- [x] Header shows the project name
- [x] Tasks for that project appear in a table with name, owner, priority, due date and status
- [x] Filter by Owner narrows the list to that owner's tasks
- [x] Filter by Tag narrows the list to tasks with that tag
- [x] Filter by Status narrows the list to that status
- [x] Sort by Priority Low-High: Low appears first
- [x] Sort by Priority High-Low: Urgent appears first
- [x] Sort by Newest First / Oldest First orders by creation date
- [x] Every filter and sort change is reflected in the browser URL
- [x] Refreshing the page preserves all active filters and sort
- [x] New Task button opens the task form with the project pre-selected
- [x] Clicking a task row opens its detail page

## Task Form (New Task / Edit)

- [x] All dropdowns are populated: project, team, owners, priority, status
- [x] Tags accept a comma-separated list
- [x] Submitting with missing required fields shows a validation error
- [x] Due date and time to complete are required
- [x] Creating a task adds it to the list
- [x] Editing a task pre-fills every field with current values

## Task Detail Page (click any task)

- [x] All task fields are shown: project, team, owners, tags, priority, due date, time to complete, status
- [x] Project name links to that project's management screen
- [x] Mark as Complete sets the task status to Completed
- [x] Edit opens the task form with current values and saves changes
- [x] Delete asks for confirmation and removes the task

## Teams Page (click Team from sidebar)

- [x] All teams are listed as cards with name, description and member avatars
- [x] New Team button opens the create-team modal
- [x] Members can be selected while creating a team
- [x] Creating a team with a duplicate name shows an error
- [x] Each team card has a menu to edit or delete the team
- [x] Editing a team updates its name, description and members
- [x] Deleting a team asks for confirmation before removing it
- [x] Clicking a team opens its detail page

## Team Detail Page (click any team)

- [x] Team name and description are shown
- [x] Members are listed with name and email
- [x] Add Member opens a picker of users not already in the team
- [x] Adding a member updates the member list
- [x] Removing a member updates the member list
- [x] That team's tasks are listed in a table below the members
- [x] Team task filters (owner, tag, status) and sort work and are reflected in the URL
- [x] Clicking a team task row opens its detail page

## Reports Page (click Reports from sidebar)

- [x] Summary cards show completed-last-week, pending days and pending task counts
- [x] Total Work Done Last Week bar chart renders
- [x] Total Days of Work Pending bar chart renders
- [x] Tasks Closed by Team pie chart renders
- [x] Tasks Closed by Owner pie chart renders
- [x] Charts show a no-data message instead of an empty area when there is nothing to plot

## Settings Page (click Settings from sidebar)

- [x] The logged-in user's name and email are shown
- [x] Log out button ends the session and returns to the login page
