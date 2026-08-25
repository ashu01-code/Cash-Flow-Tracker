# Cash-Flow Tracker

A comprehensive salary and expense tracking application built with vanilla JavaScript.



-  Add salary with validation
-  Add expenses with name and amount
-  Real-time balance calculation
-  Delete expenses with confirmation
-  LocalStorage persistence
-  Chart.js pie chart visualization

# Advanced Features
- Dark/Light mode toggle (pure black dark mode)
- Currency conversion (Frankfurter API)
- PDF report generation (jsPDF)
- Threshold alert (below 10% salary)
- Clear all data button
- Responsive design

# Technologies Used
- HTML5
- CSS3 (Pure CSS)
- Vanilla JavaScript 
- Chart.js 
- jsPDF 
- Frankfurter API

# LocalStorage

The application stores the salary and expense data in the browser's localStorage.

Because of this, refreshing or reopening the page does not remove the saved expense data.

When an expense is deleted, localStorage is also updated and the remaining balance is calculated again.

Balance Alert

If the remaining balance becomes less than 10% of the total salary, the application displays a warning banner and highlights the remaining balance.

Report Download

The Download Report button generates a PDF containing the salary, expenses and remaining balance using jsPDF.

Currency Conversion

The currency selector allows the displayed values to be converted from INR to other supported currencies using exchange rate data from the Frankfurter API.

Project Objective

The main objective of this project was to practice core JavaScript concepts such as DOM manipulation, event listeners, state handling, LocalStorage, API integration and working with external JavaScript libraries.