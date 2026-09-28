# Patient Hydration Reminder

A software-only hydration tracker for patients. It logs water intake, shows progress on a bottle that fills through the day, and reminds the patient to drink at set intervals. No smart bottle or sensor is needed.

## Live website

[Open Patient Hydration Reminder](https://kshitijchambhare-boop.github.io/patient-Hydration-Bottle-reminder/)

Built with plain HTML, CSS and JavaScript. No build step, no dependencies.

## Features

- Daily goal in ml, set to whatever the doctor advises
- One-tap logging (100, 250, 500 ml) plus a custom amount, with undo
- Reminders every N minutes during the patient's awake hours, as an in-page banner and a browser notification
- Reminders stop once the goal is reached
- Data saved on the device (localStorage), nothing sent to a server
- Accessible: large touch targets, keyboard focus, screen-reader labels, light and dark themes, reduced-motion support

## Run it

```bash
git clone https://github.com/<your-username>/patient-hydration-reminder.git
cd patient-hydration-reminder
# open index.html in a browser, or serve it:
python -m http.server 8000
```

Browser notifications work best when served over `http://localhost` or HTTPS. Keep the tab open for reminders to fire.

## Project structure

```
index.html   page structure
style.css    theme and layout
app.js       state, reminder logic, rendering
```

## How reminders work

The next reminder is due one interval after the last logged drink (or after the awake-from time if nothing is logged yet). If the patient ignores it, it repeats every interval until they log a drink or the awake window ends.

## Roadmap

- [ ] Firebase Authentication and Firestore so a caregiver or nurse can view a patient's intake
- [ ] Installable PWA with background notifications
- [ ] 7-day history chart and CSV export
- [ ] Agentic AI assistant that adjusts reminder timing from the patient's drinking pattern

## Disclaimer

This is a learning and portfolio project, not a medical device. Patients with fluid restrictions (for example heart or kidney conditions) must follow their doctor's advice.

## License

MIT
