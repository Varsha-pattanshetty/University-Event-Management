app.get('/attendee', isLoggedIn, checkRole('attendee'), (req, res) => {
    res.send(`
        <head>
            <style>
                /* Global styles */
                body {
                    font-family: 'Roboto', sans-serif;
                    background-color: #121212;
                    margin: 0;
                    padding: 0;
                    color: #f1f1f1;
                    box-sizing: border-box;
                    overflow-x: hidden;
                }

                /* Sidebar styles */
                .slidebar {
                    width: 250px;
                    height: 100%;
                    background: linear-gradient(135deg, #1f1f1f, #333);
                    color: white;
                    padding: 30px 20px;
                    position: fixed;
                    top: 0;
                    left: 0;
                    box-shadow: 4px 0 10px rgba(0, 0, 0, 0.3);
                    z-index: 100;
                }

                .slidebar button {
                    background: transparent;
                    border: none;
                    color: #f1f1f1;
                    font-size: 1.2rem;
                    margin: 20px 0;
                    width: 100%;
                    padding: 12px 20px;
                    text-align: left;
                    cursor: pointer;
                    transition: background-color 0.3s ease, transform 0.2s ease;
                    border-radius: 5px;
                }

                .slidebar button:hover {
                    background-color: #444;
                    transform: scale(1.05);
                }

                .slidebar a {
                    color: #f1f1f1;
                    text-decoration: none;
                }

                .slidebar button a:hover {
                    color: #00C6FF;
                }

                /* Main container styles */
                .container {
                    margin-left: 250px;
                    padding: 40px;
                    text-align: center;
                }

                .container h1 {
                    font-size: 3rem;
                    margin-bottom: 30px;
                    color: #fff;
                    text-transform: uppercase;
                    font-weight: bold;
                    animation: dancingText 3s infinite;
                }

                @keyframes dancingText {
                    0% { transform: translateY(0); }
                    25% { transform: translateY(-10px); }
                    50% { transform: translateY(10px); }
                    75% { transform: translateY(-5px); }
                    100% { transform: translateY(0); }
                }

                .container h3 {
                    font-size: 1.8rem;
                    margin-bottom: 40px;
                    color: #00C6FF;
                }

                /* Dashboard content boxes */
                .content-box {
                    background-color: #333;
                    border-radius: 10px;
                    margin: 20px 0;
                    padding: 20px;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }

                .content-box:hover {
                    transform: scale(1.05);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
                }

                .content-box h4 {
                    font-size: 1.5rem;
                    color: #fff;
                    margin-bottom: 15px;
                }

                .content-box p {
                    font-size: 1.1rem;
                    color: #ddd;
                    margin-bottom: 15px;
                }

                .content-box a {
                    display: inline-block;
                    margin-top: 10px;
                    padding: 12px 25px;
                    background-color: #00C6FF;
                    color: white;
                    text-decoration: none;
                    font-weight: bold;
                    border-radius: 5px;
                    transition: background-color 0.3s ease, transform 0.2s ease;
                }

                .content-box a:hover {
                    background-color: #0097b2;
                    transform: scale(1.05);
                }

                /* Footer styles */
                a.logout {
                    font-size: 1rem;
                    color: #00C6FF;
                    text-decoration: none;
                    margin-top: 30px;
                    display: inline-block;
                    padding: 12px 20px;
                    background-color: #222;
                    border-radius: 5px;
                    transition: background-color 0.3s ease;
                }

                a.logout:hover {
                    background-color: #00C6FF;
                    color: white;
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .slidebar {
                        width: 200px;
                    }

                    .container {
                        margin-left: 200px;
                    }

                    .content-box {
                        margin: 15px 0;
                        padding: 15px;
                    }

                    .content-box h4 {
                        font-size: 1.3rem;
                    }

                    .content-box p {
                        font-size: 1rem;
                    }

                    .container h1 {
                        font-size: 2rem;
                    }
                }
            </style>
        </head>
        <body>
            <div class="slidebar">
                <button><a href="/view-events">View Events</a></button>
                <button><a href="/book-event">Book Event</a></button>
                <button><a href="/view-bookings">View Bookings</a></button>
                <button><a href="/submit-feedback">Submit Feedback</a></button>
            </div>
            <div class="container">
                <h1>Welcome, Attendee</h1>
                <h3>Your Dashboard</h3>

                <div class="content-box">
                    <h4>View Events</h4>
                    <p>Browse through available events to get the most out of your experience.</p>
                    <a href="/view-events">Go to Events</a>
                </div>

                <div class="content-box">
                    <h4>Book an Event</h4>
                    <p>Find and book events that interest you and fit your schedule.</p>
                    <a href="/book-event">Book Now</a>
                </div>

                <div class="content-box">
                    <h4>View Your Bookings</h4>
                    <p>Review your upcoming events and bookings.</p>
                    <a href="/view-bookings">See Bookings</a>
                </div>

                <div class="content-box">
                    <h4>Submit Feedback</h4>
                    <p>Share your thoughts on the events you've attended to help us improve.</p>
                    <a href="/feedback-form">Give Feedback</a>
                </div>

                <a href="/logout" class="logout">Logout</a>
            </div>
        </body>
    `);
});



app.get('/view-events', isLoggedIn, checkRole('attendee'), (req, res) => {
    const query = 'SELECT * FROM events';
    db.query(query, (err, results) => {
        if (err) throw err;

        let eventsList = '';
        results.forEach(event => {
            eventsList += `
                <div class="event-box">
                    <h2>${event.name}</h2>
                    <p><strong>Date:</strong> ${event.date} | <strong>Time:</strong> ${event.time}</p>
                    <p><strong>Location:</strong> ${event.location}</p>
                    <p><strong>Price:</strong> $${event.price}</p>
                    <div class="actions">
                        <a href="/book-event?id=${event.id}">Book</a>
                    </div>
                </div>
            `;
        });

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Attendee Events</title>
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
                        padding: 20px;
                    }

                    h1 {
                        font-size: 2.5rem;
                        margin-bottom: 20px;
                        color: #4fc3f7;
                        text-shadow: 0 4px 10px rgba(79, 195, 247, 0.8);
                    }

                    /* Event Box Styling */
                    .event-box {
                        background: rgba(255, 255, 255, 0.05); /* Semi-transparent dark background */
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 10px;
                        padding: 20px;
                        margin: 10px 0;
                        width: 90%;
                        max-width: 600px;
                        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.7);
                        transition: transform 0.3s ease, box-shadow 0.3s ease;
                    }

                    .event-box:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.8);
                    }

                    .event-box h2 {
                        font-size: 1.5rem;
                        margin-bottom: 10px;
                        color: #4fc3f7;
                    }

                    .event-box p {
                        margin: 5px 0;
                        font-size: 1rem;
                        color: #bdbdbd;
                    }

                    /* Actions Styling */
                    .actions {
                        margin-top: 15px;
                    }

                    .actions a {
                        text-decoration: none;
                        color: #fff;
                        background: linear-gradient(135deg, #38b2ac, #4fc3f7);
                        padding: 8px 12px;
                        margin: 0 5px;
                        border-radius: 8px;
                        font-size: 0.9rem;
                        font-weight: bold;
                        transition: background 0.3s ease, transform 0.2s ease;
                        box-shadow: 0 6px 15px rgba(79, 195, 247, 0.4);
                    }

                    .actions a:hover {
                        background: linear-gradient(135deg, #4fc3f7, #38b2ac);
                        transform: scale(1.05);
                    }

                    /* Back to Dashboard Link */
                    a.back {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 10px 15px;
                        background: linear-gradient(135deg, #2ecc71, #27ae60);
                        color: #fff;
                        text-decoration: none;
                        border-radius: 8px;
                        font-size: 1rem;
                        font-weight: bold;
                        transition: background 0.3s ease, transform 0.2s ease;
                        box-shadow: 0 6px 15px rgba(39, 174, 96, 0.4);
                    }

                    a.back:hover {
                        background: linear-gradient(135deg, #27ae60, #2ecc71);
                        transform: scale(1.05);
                    }

                    /* Responsive Design */
                    @media screen and (max-width: 768px) {
                        h1 {
                            font-size: 2rem;
                        }

                        .event-box {
                            width: 95%;
                        }

                        .actions a {
                            font-size: 0.8rem;
                            padding: 6px 10px;
                        }

                        a.back {
                            font-size: 0.9rem;
                            padding: 8px 12px;
                        }
                    }
                </style>
            </head>
            <body>
                <h1>All Events</h1>
                ${eventsList}
                <a href="/attendee" class="back">Back to Dashboard</a>
            </body>
            </html>
        `);
    });
});



app.get('/book-event', isLoggedIn, checkRole('attendee'), (req, res) => {
    const eventId = req.query.id;
    const query = 'SELECT * FROM events WHERE id = ?';
    db.query(query, [eventId], (err, results) => {
        if (err) throw err;
        if (results.length === 0) return res.send('Event not found.');

        const event = results[0];
        res.send(`
            <link rel="stylesheet" type="text/css" href="/styles/style.css">
            <style>
                /* Dark Mode Body Styling */
                body {
                    font-family: 'Poppins', sans-serif;
                    margin: 0;
                    padding: 0;
                    background: linear-gradient(135deg, #2a2a2a, #141414);
                    color: #f1f1f1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 20px;
                }

                /* Header Styling */
                h1 {
                    font-size: 2.5rem;
                    margin-bottom: 20px;
                    color: #4fc3f7;
                    text-shadow: 0 4px 10px rgba(79, 195, 247, 0.8);
                }

                p {
                    font-size: 1.2rem;
                    margin: 10px 0;
                    color: #b0b0b0;
                }

                /* Form Styling */
                form {
                    background-color: rgba(0, 0, 0, 0.7);
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.7);
                    width: 80%;
                    max-width: 600px;
                    margin-top: 30px;
                    color: #f1f1f1;
                }

                form label {
                    font-size: 1.2rem;
                    margin-bottom: 10px;
                    display: block;
                }

                form input[type="number"],
                form input[type="text"],
                form textarea,
                form select {
                    width: 100%;
                    padding: 12px;
                    margin: 10px 0;
                    border: 1px solid #555;
                    border-radius: 5px;
                    background-color: #333;
                    color: #f1f1f1;
                    font-size: 1rem;
                }

                form button {
                    background-color: #4fc3f7;
                    color: #fff;
                    padding: 12px 25px;
                    border: none;
                    border-radius: 5px;
                    font-size: 1.2rem;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }

                form button:hover {
                    background-color: #0288d1;
                }

                /* Links Styling */
                a {
                    text-decoration: none;
                    color: #4fc3f7;
                    font-weight: bold;
                }

                a:hover {
                    color: #0288d1;
                }

                /* QR Code Payment Section */
                .payment-qr-code-container {
                    text-align: center;
                    margin-top: 30px;
                }

                .payment-qr-code-container img {
                    width: 200px;
                    height: 200px;
                    margin-bottom: 20px;
                }

                .payment-qr-code-container h3 {
                    font-size: 1.5rem;
                    margin-top: 20px;
                    color: #f1f1f1;
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    body {
                        padding: 10px;
                    }

                    form {
                        width: 90%;
                    }

                    form button {
                        width: 100%;
                    }

                    .payment-qr-code-container img {
                        width: 150px;
                        height: 150px;
                    }
                }
            </style>

            <h1>Booking Event: ${event.name}</h1>
            <p>Date: ${event.date} | Time: ${event.time} | Location: ${event.location} | Price per Ticket: $${event.price}</p>
            <form action="/select-payment" method="POST">
                <input type="hidden" name="event_id" value="${event.id}" />
                <input type="hidden" name="price" value="${event.price}" />
                <label for="tickets">Number of Tickets:</label>
                <input type="number" name="tickets" id="tickets" min="1" required /><br />
                <button type="submit">Proceed to Payment</button>
            </form>
        `);
    });
});





app.post('/book-event', (req, res) => {
    const { user_id, event_id, tickets, total_amount } = req.body;

    const query = `
        INSERT INTO bookings (user_id, event_id, tickets, total_amount, status)
        VALUES (?, ?, ?, ?, 'pending')
    `;
    
    db.query(query, [user_id, event_id, tickets, total_amount], (err, result) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).send('Database Error');
        }

        // Responding with the confirmation page that uses dark mode
        res.status(200).send(`
            <link rel="stylesheet" type="text/css" href="/styles/style.css">
            <style>
                /* Dark Mode Body Styling */
                body {
                    font-family: 'Poppins', sans-serif;
                    margin: 0;
                    padding: 0;
                    background: linear-gradient(135deg, #2a2a2a, #141414);
                    color: #f1f1f1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 20px;
                }

                /* Header Styling */
                h1 {
                    font-size: 2.5rem;
                    margin-bottom: 20px;
                    color: #4fc3f7;
                    text-shadow: 0 4px 10px rgba(79, 195, 247, 0.8);
                }

                p {
                    font-size: 1.2rem;
                    margin: 10px 0;
                    color: #b0b0b0;
                }

                /* Confirmation Box Styling */
                .confirmation-box {
                    background-color: rgba(0, 0, 0, 0.7);
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.7);
                    width: 80%;
                    max-width: 600px;
                    margin-top: 30px;
                    color: #f1f1f1;
                    text-align: center;
                }

                .confirmation-box p {
                    font-size: 1.2rem;
                    margin-bottom: 20px;
                    color: #b0b0b0;
                }

                .confirmation-box a {
                    color: #4fc3f7;
                    font-weight: bold;
                    text-decoration: none;
                    font-size: 1.2rem;
                }

                .confirmation-box a:hover {
                    color: #0288d1;
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    body {
                        padding: 10px;
                    }

                    .confirmation-box {
                        width: 90%;
                    }
                }
            </style>

            <h1>Booking Successful!</h1>
            <div class="confirmation-box">
                <p>Your booking has been successfully processed. Here are your details:</p>
                <p><strong>Event:</strong> ${event_id}</p>
                <p><strong>Number of Tickets:</strong> ${tickets}</p>
                <p><strong>Total Amount:</strong> $${total_amount}</p>
                <p>Status: Pending</p>
                <a href="/dashboard">Back to Dashboard</a>
            </div>
        `);
    });
});


// Select Payment Method
app.post('/select-payment', isLoggedIn, checkRole('attendee'), (req, res) => {
    const { event_id, tickets, price } = req.body;
    const totalAmount = tickets * price;

    res.send(`
        <link rel="stylesheet" type="text/css" href="/styles/style.css">
        <style>
            /* General Body Styling */
            body {
                font-family: 'Poppins', sans-serif;
                margin: 0;
                padding: 0;
                background: linear-gradient(135deg, #141E30, #243B55); /* Dark gradient */
                color: #E0E0E0;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 20px;
            }

            /* Header Styling */
            h1 {
                font-size: 2.5rem;
                margin-bottom: 20px;
                color: #4fc3f7;
                text-shadow: 0 4px 10px rgba(79, 195, 247, 0.8);
            }

            h3 {
                font-size: 1.5rem;
                color: #ccc;
                margin-top: 20px;
            }

            /* Payment Method Form Styling */
            form {
                margin: 20px;
                padding: 20px;
                background-color: rgba(255, 255, 255, 0.1); /* Semi-transparent dark background */
                border-radius: 10px;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.7);
                width: 60%;
                max-width: 600px;
                text-align: center;
            }

            form label {
                font-size: 1.1rem;
                margin: 10px 0;
                display: block;
                color: #bdbdbd;
            }

            form input[type="number"],
            form input[type="text"],
            form input[type="hidden"],
            form select {
                width: 100%;
                padding: 10px;
                margin: 10px 0;
                border: 1px solid #ccc;
                border-radius: 5px;
                background-color: #333;
                color: #fff;
                font-size: 1rem;
            }

            form button {
                background-color: #4fc3f7; /* Bright cyan */
                color: #fff;
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                font-size: 1.2rem;
                cursor: pointer;
                transition: background-color 0.3s ease;
            }

            form button:hover {
                background-color: #0288d1; /* Darker cyan */
            }

            /* Links Styling */
            a {
                text-decoration: none;
                color: #4fc3f7;
                font-weight: bold;
                transition: color 0.3s ease;
            }

            a:hover {
                color: #0288d1;
            }

            /* QR Code Payment Section Styling */
            .payment-qr-code-container {
                text-align: center;
                margin-top: 30px;
            }

            .payment-qr-code-container img {
                width: 200px;
                height: 200px;
                margin-bottom: 20px;
            }

            .payment-qr-code-container h3 {
                font-size: 1.5rem;
                margin-top: 20px;
                color: #ccc;
            }

            /* Responsive Design */
            @media screen and (max-width: 768px) {
                body {
                    padding: 10px;
                }

                form {
                    width: 90%;
                }
            }
        </style>

        <h1>Select Payment Method</h1>
        <p>Total Amount: $${totalAmount}</p>
        <form action="/process-payment" method="POST">
            <input type="hidden" name="event_id" value="${event_id}" />
            <input type="hidden" name="tickets" value="${tickets}" />
            <input type="hidden" name="totalAmount" value="${totalAmount}" />
            <h3>Please Do Payment Using QR code given below</h3>
            
            <div class="payment-qr-code-container">
                <img src="https://www.qrstuff.com/images/sample.png" alt="QR Code" />
            </div>
            
            <button type="submit">Proceed</button>
        </form>
    `);
});

// Route: Process Payment
app.post('/process-payment', isLoggedIn, checkRole('attendee'), async (req, res) => {
    console.log('Request Body:', req.body); // Debug
    const { event_id, tickets, totalAmount } = req.body;

    if (!event_id || !tickets || !totalAmount) {
        return res.status(400).send('Missing required fields: event_id, tickets, or totalAmount');
    }

    try {
        const userId = req.session.user?.id; // Use optional chaining to avoid crashes
        if (!userId) {
            return res.status(401).send('Unauthorized: User session not found');
        }

        const query = 'INSERT INTO bookings (user_id, event_id, tickets, total_amount, status) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [userId, event_id, tickets, totalAmount, 'Confirmed'], (err) => {
            if (err) {
                console.error('Database Error:', err.message);
                return res.status(500).send('Internal server error: Unable to process payment.');
            }
            res.send(`
                <link rel="stylesheet" type="text/css" href="/styles/style.css">
                <style>
                    /* General Body Styling */
                    body {
                        font-family: 'Poppins', sans-serif;
                        margin: 0;
                        padding: 0;
                        background: linear-gradient(135deg, #141E30, #243B55);
                        color: #E0E0E0;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        padding: 20px;
                    }

                    /* Header Styling */
                    h1 {
                        font-size: 2.5rem;
                        margin-bottom: 20px;
                        color: #4fc3f7;
                        text-shadow: 0 4px 10px rgba(79, 195, 247, 0.8);
                    }

                    /* Payment Confirmation Box Styling */
                    .confirmation-box {
                        background: rgba(255, 255, 255, 0.1); /* Semi-transparent dark background */
                        border-radius: 10px;
                        padding: 30px;
                        margin-top: 30px;
                        width: 80%;
                        max-width: 600px;
                        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.7);
                        text-align: center;
                    }

                    .confirmation-box p {
                        font-size: 1.2rem;
                        margin: 20px 0;
                        color: #bdbdbd;
                    }

                    /* Links Styling */
                    .confirmation-box a {
                        color: #4fc3f7;
                        font-weight: bold;
                        text-decoration: none;
                    }

                    .confirmation-box a:hover {
                        color: #0288d1;
                    }

                    /* Responsive Design */
                    @media screen and (max-width: 768px) {
                        body {
                            padding: 10px;
                        }

                        .confirmation-box {
                            width: 90%;
                        }
                    }
                </style>

                <h1>Payment Successful</h1>
                <div class="confirmation-box">
                    <p>Your booking has been confirmed. Thank you for your payment!</p>
                    <p><a href="/attendee">Go back to Dashboard</a></p>
                </div>
            `);
        });
    } catch (error) {
        console.error('Unexpected Error:', error.message);
        res.status(500).send('Internal server error: Something went wrong.');
    }
});


app.post('/submit-feedback', isLoggedIn, checkRole('attendee'), async (req, res) => {
    console.log('Request Body:', req.body); // Debug
    const { event_id, feedback } = req.body;
    const userId = req.session.user?.id;

    if (!event_id || !feedback) {
        return res.status(400).send('Missing required fields: event_id or feedback');
    }

    if (!userId) {
        return res.status(401).send('Unauthorized: User session not found');
    }

    try {
        const query = 'INSERT INTO feedback (event_id, user_id, feedback_text) VALUES (?, ?, ?)';
        db.query(query, [event_id, userId, feedback], (err) => {
            if (err) {
                console.error('Database Error:', err.message);
                return res.status(500).send('Internal server error: Unable to submit feedback.');
            }
            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Feedback Submitted</title>
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
                            p { font-size: 1rem; }
                            .back-button { font-size: 1rem; }
                        }
                    </style>
                </head>
                <body>
                    <h1>Feedback Submitted Successfully</h1>
                    <p>Thank you for your feedback. <a href="/attendee" class="back-button">Go back to Dashboard</a></p>
                </body>
                </html>
            `);
        });
    } catch (error) {
        console.error('Unexpected Error:', error.message);
        res.status(500).send('Internal server error: Something went wrong.');
    }
});



app.get('/view-feedback/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;

        const [rows] = await db.query(
            'SELECT user_id, feedback_text FROM feedback WHERE event_id = ?',
            [eventId]
        );

        res.status(200).send(`
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
                        color: #e63946;
                        text-shadow: 0 4px 8px rgba(230, 57, 70, 0.5);
                        animation: glow 1.5s infinite alternate;
                    }

                    @keyframes glow {
                        from { text-shadow: 0 4px 8px rgba(230, 57, 70, 0.5); }
                        to { text-shadow: 0 8px 16px rgba(230, 57, 70, 0.8); }
                    }

                    p {
                        font-size: 1.2rem;
                        margin-bottom: 20px;
                        color: #d1d1d1;
                        text-align: center;
                        max-width: 800px;
                    }

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
                        background: #e63946;
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
                <h1>Feedback for Event</h1>
                <p>Below are the feedbacks submitted by attendees for your event. Review the feedback and take action accordingly.</p>
                <table>
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Feedback</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map(feedback => `
                            <tr>
                                <td>${feedback.user_id}</td>
                                <td>${feedback.feedback_text}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <a class="back-button" href="/organizer-dashboard">Back to Dashboard</a>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Error retrieving feedback:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.post('/submit-feedback', isLoggedIn, checkRole('attendee'), (req, res) => {
    const { event_id, feedback, attendee_id } = req.body;  // attendee_id comes from the form (hidden field)
    const loggedInAttendeeId = req.session.user.id;  // Get the attendee ID from the session

    // Ensure that the attendee_id from the form matches the logged-in user
    if (!event_id || !feedback || attendee_id !== loggedInAttendeeId) {
        return res.status(400).send('Event ID, Feedback, and correct Attendee ID are required');
    }

    // Insert feedback into the database
    const query = 'INSERT INTO feedback (event_id, attendee_id, feedback) VALUES (?, ?, ?)';
    db.query(query, [event_id, attendee_id, feedback], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('An error occurred while submitting feedback');
        }
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Feedback Submitted</title>
                <style>
                    /* General Styling */
                    body {
                        font-family: 'Roboto', sans-serif;
                        background: #f0f0f0;
                        color: #333;
                        margin: 0;
                        padding: 0;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        background-color: #f8f9fa;
                    }

                    h1 {
                        font-size: 2.5rem;
                        color: #007bff;
                        margin: 20px;
                    }

                    p {
                        font-size: 1.2rem;
                        color: #333;
                        text-align: center;
                        margin: 10px 0;
                    }

                    .feedback-thank-you {
                        background-color: #ffffff;
                        border: 1px solid #d1d1d1;
                        padding: 30px;
                        border-radius: 8px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        max-width: 500px;
                        width: 100%;
                        text-align: center;
                    }

                    a {
                        text-decoration: none;
                        color: #007bff;
                        font-weight: bold;
                        transition: color 0.3s ease;
                    }

                    a:hover {
                        color: #0056b3;
                    }

                    /* Button Styling */
                    .back-button {
                        padding: 10px 20px;
                        background-color: #007bff;
                        color: white;
                        border-radius: 5px;
                        font-size: 1.2rem;
                        font-weight: 600;
                        margin-top: 20px;
                        text-align: center;
                        display: inline-block;
                        transition: background-color 0.3s ease;
                    }

                    .back-button:hover {
                        background-color: #0056b3;
                    }

                    /* Responsive Design */
                    @media (max-width: 768px) {
                        h1 { font-size: 2rem; }
                        p { font-size: 1rem; }
                    }
                </style>
            </head>
            <body>
                <div class="feedback-thank-you">
                    <h1>Feedback Submitted</h1>
                    <p>Thank you for your feedback. <a href="/attendee">Back to Dashboard</a></p>
                    <a class="back-button" href="/attendee">Back to Dashboard</a>
                </div>
            </body>
            </html>
        `);
    });
});


app.get('/feedback-form', isLoggedIn, checkRole('attendee'), (req, res) => {
    const attendeeId = req.session.user.id;  // Get the attendee ID from the session

    // Fetch all events (no registration check)
    const query = `
        SELECT id, name FROM events
    `;
    db.query(query, (err, events) => {
        if (err) {
            console.error(err);
            return res.status(500).send('An error occurred while fetching events');
        }

        if (events.length === 0) {
            return res.send('<p>No events available for feedback.</p>');
        }

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Submit Feedback</title>
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

                    label {
                        font-size: 1.2rem;
                        color: #d1d1d1;
                        margin-top: 15px;
                        display: block;
                    }

                    select, textarea, input {
                        width: 100%;
                        padding: 12px;
                        background-color: #2c5364;  /* Dark background for input elements */
                        border: 1px solid #4fd1c5; /* Lighter border to contrast with background */
                        color: #f0f0f0;  /* White text */
                        border-radius: 5px;
                        margin-top: 10px;
                        font-size: 1rem;
                    }

                    textarea {
                        resize: vertical;
                    }

                    .feedback-form-container {
                        background-color: #1c3d4a; /* Dark background for the form container */
                        border: 1px solid #4fd1c5;
                        padding: 30px;
                        border-radius: 8px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
                        max-width: 500px;
                        width: 100%;
                        text-align: center;
                    }

                    button {
                        padding: 12px 20px;
                        background-color: #4fd1c5;
                        color: white;
                        border-radius: 5px;
                        font-size: 1.2rem;
                        font-weight: 600;
                        margin-top: 20px;
                        text-align: center;
                        display: inline-block;
                        transition: background-color 0.3s ease;
                    }

                    button:hover {
                        background-color: #38b2ac;
                    }

                    .back-button {
                        margin-top: 30px;
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
                        label { font-size: 1rem; }
                        .back-button { font-size: 1rem; }
                    }
                </style>
            </head>
            <body>
                <div class="feedback-form-container">
                    <h1>Submit Your Feedback</h1>
                    <form action="/submit-feedback" method="POST">
                        <!-- Hidden field for attendee_id -->
                        <input type="hidden" name="attendee_id" value="${attendeeId}" required>

                        <label for="event_id">Select Event</label>
                        <select id="event_id" name="event_id" required>
                            ${events.map(event => `
                                <option value="${event.id}">${event.name}</option>
                            `).join('')}
                        </select>

                        <label for="feedback">Your Feedback</label>
                        <textarea id="feedback" name="feedback" rows="5" required></textarea>

                        <button type="submit">Submit Feedback</button>
                    </form>
                </div>
            </body>
            </html>
        `);
    });
});



/*
// View Bookings (Booking History) for Attendees
app.get('/view-bookings', isLoggedIn, checkRole('attendee'), (req, res) => {
    const userId = req.session.user.id; // Assuming user ID is stored in the session

    // Query to fetch bookings for the logged-in attendee
    const query = `
        SELECT bookings.id, events.name AS event_name, bookings.tickets, bookings.total_amount, bookings.status, bookings.created_at
        FROM bookings
        JOIN events ON bookings.event_id = events.id
        WHERE bookings.user_id = ?
        ORDER BY bookings.created_at DESC
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('An error occurred while fetching your bookings.');
        }

        if (results.length === 0) {
            return res.send(`
                <h1>No bookings found</h1>
                <p>You haven't made any bookings yet.</p>
                <a href="/attendee">Back to Dashboard</a>
            `);
        }

        // Generate the booking history table
        let bookingsTable = '';
        results.forEach(booking => {
            bookingsTable += `
                <tr>
                    <td>${booking.event_name}</td>
                    <td>${booking.tickets}</td>
                    <td>$${booking.total_amount}</td>
                    <td>${booking.status}</td>
                    <td>${booking.created_at}</td>
                </tr>
            `;
        });

        // Render the page with the booking history table
        res.send(`
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Booking History</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        width: 80%;
                        margin: 20px auto;
                        background-color: white;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }
                    h1 {
                        text-align: center;
                        color: #333;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }
                    table, th, td {
                        border: 1px solid #ddd;
                        text-align: left;
                    }
                    th, td {
                        padding: 10px;
                        text-align: center;
                    }
                    th {
                        background-color: #007bff;
                        color: white;
                    }
                    td {
                        background-color: #f9f9f9;
                    }
                    td a {
                        color: #007bff;
                        text-decoration: none;
                    }
                    td a:hover {
                        text-decoration: underline;
                    }
                    a {
                        display: inline-block;
                        padding: 10px 20px;
                        margin-top: 20px;
                        background-color: #28a745;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bold;
                        text-align: center;
                    }
                    a:hover {
                        background-color: #218838;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Your Booking History</h1>
                    <table>
                        <thead>
                            <tr>
                                <th>Event Name</th>
                                <th>Tickets</th>
                                <th>Total Amount</th>
                                <th>Status</th>
                                <th>Booking Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${bookingsTable}
                        </tbody>
                    </table>
                    <a href="/attendee">Back to Dashboard</a>
                </div>
            </body>
            </html>
        `);
    });
});


*/



app.get('/view-bookings', isLoggedIn, checkRole('attendee'), (req, res) => {
    const userId = req.session.user.id; // Assuming user ID is stored in the session

    // Query to fetch bookings for the logged-in attendee
    const query = `
        SELECT bookings.id, events.name AS event_name, bookings.tickets, bookings.total_amount, bookings.status, bookings.created_at
        FROM bookings
        JOIN events ON bookings.event_id = events.id
        WHERE bookings.user_id = ?
        ORDER BY bookings.created_at DESC
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('An error occurred while fetching your bookings.');
        }

        if (results.length === 0) {
            return res.send(`
                <h1>No bookings found</h1>
                <p>You haven't made any bookings yet.</p>
                <a href="/attendee">Back to Dashboard</a>
            `);
        }

        // Generate the booking history table
        let bookingsTable = '';
        results.forEach(booking => {
            bookingsTable += `
                <tr>
                    <td>${booking.event_name}</td>
                    <td>${booking.tickets}</td>
                    <td>$${booking.total_amount}</td>
                    <td>${booking.status}</td>
                    <td>${booking.created_at}</td>
                </tr>
            `;
        });

        // Render the page with the booking history table
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Booking History</title>
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
                <h1>Your Booking History</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Event Name</th>
                            <th>Tickets</th>
                            <th>Total Amount</th>
                            <th>Status</th>
                            <th>Booking Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${bookingsTable}
                    </tbody>
                </table>
                <a class="back-button" href="/attendee">Back to Dashboard</a>
            </body>
            </html>
        `);
    });
});
