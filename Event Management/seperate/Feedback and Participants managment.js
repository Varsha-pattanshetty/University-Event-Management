app.post('/display-feedback', (req, res) => {
    const eventName = req.body.eventName;
    console.log("Searching for event:", eventName);

    // Query to find the event by name
    const query = 'SELECT * FROM events WHERE name = ?';
    db.query(query, [eventName], (err, event) => {
        if (err) {
            console.log("Error fetching event:", err);
            return res.status(500).send('Error fetching event');
        }

        if (event.length === 0) {
            return res.status(404).send('Event not found');
        }

        // Event found, now fetch feedback for this event
        const feedbackQuery = 'SELECT feedback_text, created_at, user_id FROM feedback WHERE event_id = ?';
        db.query(feedbackQuery, [event[0].id], (err, feedback) => {
            if (err) {
                console.log("Error fetching feedback:", err);
                return res.status(500).send('Error fetching feedback');
            }

            if (feedback.length === 0) {
                return res.send('No feedback found for this event');
            }

            // Render the page with the feedback data
            let feedbackHTML = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Feedback for Event</title>
                    <style>
                        /* General Styling */
                        body {
                            font-family: 'Poppins', sans-serif;
                            margin: 0;
                            padding: 0;
                            background: linear-gradient(135deg, #1a1a2e, #16213e);
                            color: #d6d6d6;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            min-height: 100vh;
                            animation: fadeIn 0.8s ease-in-out;
                        }

                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(-10px); }
                            to { opacity: 1; transform: translateY(0); }
                        }

                        /* Header Styling */
                        h1 {
                            font-size: 2.8rem;
                            margin: 20px 0;
                            color: #4fc3f7;
                            text-align: center;
                            text-shadow: 0 4px 8px rgba(79, 195, 247, 0.5);
                        }

                        p {
                            font-size: 1.2rem;
                            margin: 10px 0;
                            color: #b2becd;
                            text-align: center;
                            max-width: 800px;
                        }

                        /* Feedback Table Container */
                        .table-container {
                            width: 90%;
                            max-width: 1100px;
                            background: rgba(255, 255, 255, 0.05);
                            backdrop-filter: blur(6px);
                            margin: 20px 0;
                            border-radius: 15px;
                            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
                            overflow-x: auto;
                        }

                        /* Table Styling */
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            color: #d6d6d6;
                        }

                        table th, table td {
                            padding: 15px;
                            text-align: left;
                            font-size: 1rem;
                        }

                        table th {
                            background: #0f3460;
                            color: #ffffff;
                            font-weight: bold;
                            text-transform: uppercase;
                        }

                        table tr {
                            background: rgba(255, 255, 255, 0.05);
                            transition: background 0.3s ease, transform 0.3s ease;
                        }

                        table tr:hover {
                            background: rgba(255, 255, 255, 0.1);
                            transform: scale(1.02);
                        }

                        table tr:nth-child(even) {
                            background: rgba(255, 255, 255, 0.03);
                        }

                        /* Back Button */
                        .back-button {
                            margin: 20px 0;
                            padding: 10px 20px;
                            font-size: 1rem;
                            font-weight: bold;
                            color: #ffffff;
                            background: linear-gradient(135deg, #4fc3f7, #38b2ac);
                            text-decoration: none;
                            border-radius: 8px;
                            box-shadow: 0 4px 10px rgba(79, 195, 247, 0.5);
                            transition: all 0.3s ease-in-out;
                        }

                        .back-button:hover {
                            background: linear-gradient(135deg, #38b2ac, #4fc3f7);
                            transform: scale(1.05);
                        }

                        /* Responsive Design */
                        @media (max-width: 768px) {
                            h1 {
                                font-size: 2rem;
                            }

                            table th, table td {
                                font-size: 0.9rem;
                                padding: 10px;
                            }

                            .back-button {
                                font-size: 0.9rem;
                            }
                        }
                    </style>
                </head>
                <body>
                    <h1>Feedback for Event: ${eventName}</h1>
                    <p>Here’s a list of feedback submitted by users for this event. Use this data to analyze and improve future events!</p>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>User ID</th>
                                    <th>Feedback</th>
                                    <th>Submitted At</th>
                                </tr>
                            </thead>
                            <tbody>
            `;

            feedback.forEach(feedbackItem => {
                feedbackHTML += `
                    <tr>
                        <td>${feedbackItem.user_id}</td>
                        <td>${feedbackItem.feedback_text}</td>
                        <td>${new Date(feedbackItem.created_at).toLocaleString()}</td>
                    </tr>
                `;
            });

            feedbackHTML += `
                            </tbody>
                        </table>
                    </div>
                    <a class="back-button" href="/view-feedback">Go Back</a>
                </body>
                </html>
            `;

            res.send(feedbackHTML);
        });
    });
});



app.get('/view-registrations', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>View Registrations</title>
            <style>
                /* General Body Styling */
                body {
                    font-family: 'Poppins', sans-serif;
                    margin: 0;
                    padding: 0;
                    background: radial-gradient(circle at center, #1e1e30, #121212);
                    color: #ffffff;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    animation: fadeIn 1s ease-in-out;
                }

                /* Smooth Fade-in Animation for Page Load */
                @keyframes fadeIn {
                    0% {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                /* Header Styling */
                h1 {
                    font-size: 2.8rem;
                    text-align: center;
                    margin-bottom: 20px;
                    color: #4fd1c5;
                    text-shadow: 0 4px 6px rgba(79, 209, 197, 0.5);
                    animation: glow 1.5s infinite alternate;
                }

                /* Glow Animation for Header */
                @keyframes glow {
                    from {
                        text-shadow: 0 4px 6px rgba(79, 209, 197, 0.5);
                    }
                    to {
                        text-shadow: 0 8px 12px rgba(79, 209, 197, 0.8);
                    }
                }

                /* Form Container Styling */
                form {
                    width: 90%;
                    max-width: 500px;
                    background: linear-gradient(145deg, #232341, #1a1a35);
                    border-radius: 15px;
                    padding: 25px 35px;
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.8);
                    color: #ffffff;
                    animation: slideUp 1s ease;
                }

                /* Slide-Up Animation for Form */
                @keyframes slideUp {
                    0% {
                        opacity: 0;
                        transform: translateY(50px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                form label {
                    font-size: 1.2rem;
                    margin-bottom: 10px;
                    display: block;
                    font-weight: bold;
                    color: #4fd1c5;
                }

                form input {
                    width: 100%;
                    padding: 12px 15px;
                    font-size: 1rem;
                    border: 1px solid #4fd1c5;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    background: #1e1e30;
                    color: #ffffff;
                    transition: all 0.3s ease-in-out;
                }

                form input:focus {
                    border-color: #4fd1c5;
                    outline: none;
                    box-shadow: 0 0 10px rgba(79, 209, 197, 0.8);
                    background: #121212;
                }

                form button {
                    width: 100%;
                    background: linear-gradient(135deg, #4fd1c5, #3bbfb4);
                    color: #ffffff;
                    padding: 12px 20px;
                    font-size: 1.2rem;
                    border: none;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: background 0.3s ease, transform 0.2s;
                    box-shadow: 0 6px 15px rgba(79, 209, 197, 0.5);
                }

                form button:hover {
                    background: linear-gradient(135deg, #3bbfb4, #4fd1c5);
                    transform: translateY(-3px);
                    box-shadow: 0 10px 20px rgba(79, 209, 197, 0.8);
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    h1 {
                        font-size: 2.2rem;
                    }

                    form {
                        padding: 20px 25px;
                    }

                    form button {
                        font-size: 1rem;
                    }
                }
            </style>
        </head>
        <body>
            <h1>Enter Event Name to View Registrations</h1>
            <form action="/display-registrations" method="POST">
                <label for="eventName">Event Name:</label>
                <input type="text" id="eventName" name="eventName" placeholder="Enter event name" required>
                <button type="submit">Display Registrations</button>
            </form>
        </body>
        </html>
    `);
});


app.post('/display-registrations', (req, res) => {
    const eventName = req.body.eventName; // Get the event name from the form input
    console.log("Searching for event:", eventName);

    // Ensure the user is logged in (using session)
    if (!req.session.user) {
        return res.status(401).send('You need to be logged in to view registrations');
    }

    const organizerId = req.session.user.id;
    const query = 'SELECT * FROM events WHERE name = ? AND organizer_id = ?';

    // Step 1: Find the event by name and organizer_id (ensure it's the logged-in organizer's event)
    db.query(query, [eventName, organizerId], (err, event) => {
        if (err) {
            console.log("Error fetching event:", err);
            return res.status(500).send('Error fetching event');
        }

        if (event.length === 0) {
            console.log("Event not found for organizer:", eventName);
            return res.status(404).send('Event not found or you are not the organizer of this event');
        }

        const eventId = event[0].id;

        // Step 2: Fetch bookings for this event
        const bookingsQuery = `
            SELECT b.id, b.user_id, b.event_id, b.tickets, b.total_amount, b.status, b.created_at
            FROM bookings b
            WHERE b.event_id = ?
        `;

        db.query(bookingsQuery, [eventId], (err, bookings) => {
            if (err) {
                console.log("Error fetching bookings for event_id:", eventId, err);
                return res.status(500).send('Error fetching bookings');
            }

            if (bookings.length === 0) {
                console.log("No bookings found for event:", eventId);
                return res.send('No bookings found for this event');
            }

            // Step 3: Render the page with the bookings data
            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Registrations for ${event[0].name}</title>
                    <style>
                        /* General Styling */
                        body {
                            font-family: 'Poppins', sans-serif;
                            background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
                            color: #f0f0f0;
                            margin: 0;
                            padding: 0;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            min-height: 100vh;
                            overflow-x: hidden;
                            animation: fadeIn 1s ease-in-out;
                        }

                        @keyframes fadeIn {
                            0% { opacity: 0; transform: translateY(-10px); }
                            100% { opacity: 1; transform: translateY(0); }
                        }

                        h1 {
                            font-size: 3rem;
                            margin: 20px 0;
                            text-align: center;
                            color: #4fd1c5;
                            text-shadow: 0 4px 8px rgba(79, 209, 197, 0.5);
                            animation: glow 1.5s infinite alternate;
                        }

                        @keyframes glow {
                            from { text-shadow: 0 4px 8px rgba(79, 209, 197, 0.5); }
                            to { text-shadow: 0 8px 16px rgba(79, 209, 197, 0.8); }
                        }

                        p {
                            font-size: 1.2rem;
                            margin-bottom: 20px;
                            color: #d1d1d1;
                            text-align: center;
                            max-width: 800px;
                        }

                        /* Table Styling */
                        table {
                            width: 90%;
                            max-width: 1200px;
                            border-collapse: collapse;
                            margin: 20px 0;
                            background: rgba(255, 255, 255, 0.05);
                            backdrop-filter: blur(5px);
                            border-radius: 10px;
                            overflow: hidden;
                            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
                        }

                        th, td {
                            padding: 15px;
                            text-align: center;
                            color: #ffffff;
                        }

                        th {
                            background: #4fd1c5;
                            color: #1a1a35;
                            font-weight: 600;
                            text-transform: uppercase;
                        }

                        tr {
                            transition: all 0.3s ease;
                        }

                        tr:hover {
                            background: rgba(255, 255, 255, 0.1);
                            transform: scale(1.02);
                        }

                        tr:nth-child(even) {
                            background-color: rgba(255, 255, 255, 0.05);
                        }

                        /* Back Button */
                        .back-button {
                            margin: 30px 0;
                            padding: 12px 20px;
                            text-decoration: none;
                            font-size: 1.1rem;
                            font-weight: 600;
                            color: #ffffff;
                            background: linear-gradient(135deg, #e63946, #f45d22);
                            border-radius: 8px;
                            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
                            transition: background 0.3s, transform 0.3s;
                        }

                        .back-button:hover {
                            background: linear-gradient(135deg, #f45d22, #e63946);
                            transform: scale(1.05);
                        }

                        /* Responsive Design */
                        @media (max-width: 768px) {
                            h1 { font-size: 2rem; }
                            table th, table td { font-size: 0.9rem; padding: 10px; }
                            .back-button { font-size: 1rem; }
                        }
                    </style>
                </head>
                <body>
                    <h1>Registrations for ${event[0].name}</h1>
                    <p>Below are the details of all registrations for your event. Ensure you confirm the booking statuses and manage ticket allocations effectively.</p>
                    <table>
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Tickets</th>
                                <th>Total Amount</th>
                                <th>Status</th>
                                <th>Booking Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${bookings.map(booking => `
                                <tr>
                                    <td>${booking.user_id}</td>
                                    <td>${booking.tickets}</td>
                                    <td>$${booking.total_amount.toFixed(2)}</td>
                                    <td>${booking.status}</td>
                                    <td>${new Date(booking.created_at).toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <a class="back-button" href="/view-registrations">Back to Dashboard</a>
                </body>
                </html>
            `);
        });
    });
});

// Route to show the form to enter event name
app.get('/view-feedback', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>View Feedback</title>
            <style>
                /* General Styling */
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Poppins', sans-serif;
                    background: linear-gradient(135deg, #141E30, #243B55);
                    color: #E0E0E0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    overflow: hidden;
                }

                /* Form Container */
                form {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    padding: 30px 40px;
                    border-radius: 15px;
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
                    width: 90%;
                    max-width: 400px;
                    text-align: center;
                }

                h1 {
                    font-size: 2.5rem;
                    margin-bottom: 20px;
                    color: #4fc3f7;
                    text-shadow: 0 4px 10px rgba(79, 195, 247, 0.8);
                }

                label {
                    display: block;
                    font-size: 1.2rem;
                    margin-bottom: 10px;
                    text-align: left;
                    color: #bdbdbd;
                }

                /* Input Field Styling */
                input[type="text"] {
                    width: 100%;
                    padding: 12px 15px;
                    font-size: 1rem;
                    border: none;
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.2);
                    color: #fff;
                    box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.2);
                    transition: all 0.3s ease;
                }

                input[type="text"]:focus {
                    outline: none;
                    background: rgba(255, 255, 255, 0.3);
                    box-shadow: inset 0 6px 12px rgba(0, 0, 0, 0.3);
                }

                /* Button Styling */
                button {
                    margin-top: 20px;
                    padding: 12px 20px;
                    font-size: 1.1rem;
                    font-weight: bold;
                    color: #fff;
                    background: linear-gradient(135deg, #4fc3f7, #38b2ac);
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    box-shadow: 0 6px 15px rgba(79, 195, 247, 0.4);
                    transition: all 0.3s ease;
                }

                button:hover {
                    background: linear-gradient(135deg, #38b2ac, #4fc3f7);
                    transform: scale(1.05);
                    box-shadow: 0 10px 30px rgba(79, 195, 247, 0.7);
                }

                button:active {
                    transform: scale(1.02);
                }

                /* Decorative Background Particles */
                .particle {
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.15);
                    animation: float 10s infinite ease-in-out;
                    pointer-events: none;
                }

                .particle:nth-child(1) {
                    width: 20px;
                    height: 20px;
                    top: 10%;
                    left: 15%;
                    animation-duration: 7s;
                }

                .particle:nth-child(2) {
                    width: 30px;
                    height: 30px;
                    top: 30%;
                    left: 70%;
                    animation-duration: 9s;
                }

                .particle:nth-child(3) {
                    width: 15px;
                    height: 15px;
                    top: 60%;
                    left: 40%;
                    animation-duration: 11s;
                }

                .particle:nth-child(4) {
                    width: 25px;
                    height: 25px;
                    top: 80%;
                    left: 20%;
                    animation-duration: 13s;
                }

                .particle:nth-child(5) {
                    width: 10px;
                    height: 10px;
                    top: 20%;
                    left: 90%;
                    animation-duration: 6s;
                }

                @keyframes float {
                    0% {
                        transform: translateY(0) translateX(0);
                        opacity: 0.8;
                    }
                    50% {
                        transform: translateY(-20px) translateX(10px);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(0) translateX(0);
                        opacity: 0.8;
                    }
                }
            </style>
        </head>
        <body>
            <h1>Enter Event Name</h1>
            <form action="/display-feedback" method="POST">
                <label for="eventName">Event Name:</label>
                <input type="text" id="eventName" name="eventName" placeholder="Enter the event name..." required>
                <button type="submit">Display Feedback</button>
            </form>

            <!-- Background Particles -->
            <div class="particle"></div>
            <div class="particle"></div>
            <div class="particle"></div>
            <div class="particle"></div>
            <div class="particle"></div>
        </body>
        </html>
    `);
});


// Route to handle displaying feedback for the event
app.post('/display-feedback', (req, res) => {
    const eventName = req.body.eventName; // Get the event name from the form input
    console.log("Searching for event:", eventName);

    // Query to find the event by name
    const query = 'SELECT * FROM events WHERE name = ?';
    db.query(query, [eventName], (err, event) => {
        if (err) {
            console.log("Error fetching event:", err);
            return res.status(500).send('Error fetching event');
        }

        if (event.length === 0) {
            return res.status(404).send('Event not found');
        }

        // Event found, now fetch feedback for this event
        const feedbackQuery = 'SELECT feedback_text, created_at, user_id FROM feedback WHERE event_id = ?';
        db.query(feedbackQuery, [event[0].id], (err, feedback) => {
            if (err) {
                console.log("Error fetching feedback:", err);
                return res.status(500).send('Error fetching feedback');
            }

            if (feedback.length === 0) {
                return res.send('No feedback found for this event');
            }

            // Render the page with the feedback data and embedded CSS
            let feedbackHTML = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Feedback for Event</title>
                    <style>
                        /* General Styling */
                        body {
                            font-family: 'Poppins', sans-serif;
                            margin: 0;
                            padding: 0;
                            background: linear-gradient(135deg, #141E30, #243B55); /* Dark gradient */
                            color: #E0E0E0;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: flex-start;
                            min-height: 100vh;
                            text-align: center;
                        }

                        h1 {
                            font-size: 2.5rem;
                            margin: 20px;
                            color: #4fc3f7;
                            text-shadow: 0 4px 10px rgba(79, 195, 247, 0.8);
                        }

                        /* Table Styling */
                        table {
                            width: 90%;
                            max-width: 1000px;
                            margin: 20px auto;
                            border-collapse: collapse;
                            border-spacing: 0;
                            background: rgba(255, 255, 255, 0.05); /* Semi-transparent background */
                            border-radius: 15px;
                            overflow: hidden;
                            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.7);
                        }

                        thead {
                            background-color: #4fc3f7;
                        }

                        thead th {
                            padding: 15px;
                            font-size: 1.1rem;
                            color: #141E30;
                            text-transform: uppercase;
                        }

                        tbody tr {
                            background-color: rgba(255, 255, 255, 0.05);
                            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                            transition: all 0.3s ease;
                        }

                        tbody tr:hover {
                            background-color: rgba(255, 255, 255, 0.1);
                            transform: scale(1.02);
                        }

                        tbody td {
                            padding: 12px 15px;
                            font-size: 1rem;
                            color: #bdbdbd;
                        }

                        /* Go Back Button Styling */
                        a {
                            display: inline-block;
                            margin: 20px auto;
                            padding: 12px 20px;
                            background: linear-gradient(135deg, #38b2ac, #4fc3f7);
                            color: #fff;
                            font-size: 1rem;
                            font-weight: bold;
                            text-decoration: none;
                            border-radius: 8px;
                            box-shadow: 0 6px 15px rgba(79, 195, 247, 0.4);
                            transition: all 0.3s ease;
                        }

                        a:hover {
                            background: linear-gradient(135deg, #4fc3f7, #38b2ac);
                            transform: scale(1.05);
                            box-shadow: 0 10px 30px rgba(79, 195, 247, 0.7);
                        }

                        a:active {
                            transform: scale(1.02);
                        }

                        /* Responsive Design */
                        @media screen and (max-width: 768px) {
                            h1 {
                                font-size: 2rem;
                            }

                            table thead th, table tbody td {
                                font-size: 0.9rem;
                                padding: 10px;
                            }

                            a {
                                font-size: 0.9rem;
                                padding: 10px 15px;
                            }
                        }
                    </style>
                </head>
                <body>
                    <h1>Feedback for the Event: ${eventName}</h1>
                    <table>
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Feedback</th>
                                <th>Submitted At</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            feedback.forEach(feedbackItem => {
                feedbackHTML += `
                    <tr>
                        <td>${feedbackItem.user_id}</td>
                        <td>${feedbackItem.feedback_text}</td>
                        <td>${feedbackItem.created_at}</td>
                    </tr>
                `;
            });

            feedbackHTML += `
                        </tbody>
                    </table>
                    <a href="/view-feedback">Go Back</a>
                </body>
                </html>
            `;

            res.send(feedbackHTML); // Send the generated HTML as response
        });
    });
});
