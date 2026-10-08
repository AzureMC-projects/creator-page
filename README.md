# Azure Creator Program

A static application site for the Azure Creator Program, designed for deployment on Netlify.

## Form submissions

The application form uses **Netlify Forms**. No email address, API key, or secret is exposed in the site code.

After the first successful Netlify deploy:

1. Open the site in Netlify.
2. Go to **Forms** and confirm the `creator-application` form was detected.
3. Open **Project configuration → Notifications → Form submission notifications**.
4. Add an email notification for the `creator-application` form.
5. Set the notification recipient to **azureytsupport@gmail.com**.

Netlify will then email new applications to that address while also keeping submissions in the Netlify Forms dashboard.

## Deploy

This project is plain HTML/CSS/JS, so no build command is required.

Recommended Netlify settings:
- Build command: leave empty
- Publish directory: `.`

If Netlify is connected to this GitHub repository, pushes to the default branch will trigger a new deploy automatically.

## Fields collected

- Name / nickname
- Discord username
- Age range
- Main area of interest
- Project idea
- What they want to do with the program
- Support they're looking for
- Existing experience
- Contact consent

The form intentionally asks for a nickname rather than a full legal name.
