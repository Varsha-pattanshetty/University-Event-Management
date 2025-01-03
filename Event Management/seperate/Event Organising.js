// Organizer Dashboard
app.get('/organizer', isLoggedIn, checkRole('organizer'), (req, res) => {
    res.send(`
        <style>
            /* Global styles */
            body {
                font-family: 'Arial', sans-serif;
                margin: 0;
                padding: 0;
                background-color: #212529;
                color: #e9ecef;
                line-height: 1.6;
            }

            /* Sidebar styles */
            .slidebar {
                width: 270px;
                height: 100%;
                background-color: #343a40;
                position: fixed;
                top: 0;
                left: 0;
                padding: 40px 20px;
                box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
            }

            .slidebar button {
                background: transparent;
                border: none;
                color: #e9ecef;
                font-size: 1.1rem;
                margin: 15px 0;
                width: 100%;
                padding: 12px;
                text-align: left;
                cursor: pointer;
                transition: background-color 0.3s ease, transform 0.3s ease;
                border-radius: 5px;
                font-weight: 600;
            }

            .slidebar button:hover {
                background-color: #6c757d;
                transform: scale(1.05);
            }

            .slidebar button a {
                color: inherit;
                text-decoration: none;
            }

            /* Main container styles */
            .container {
                margin-left: 270px;
                padding: 50px;
                padding-top: 30px;
                min-height: 100vh;
                background-color: #343a40;
                transition: margin-left 0.3s ease;
            }

            .container h1 {
                font-size: 3rem;
                color: #ffffff;
                font-weight: 700;
                margin-bottom: 20px;
                text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.1);
            }

            .container h3 {
                font-size: 1.8rem;
                margin-bottom: 30px;
                color: #007bff;
                font-weight: 500;
            }

            /* Subfunctionalities Box Layout */
            .functionality-box {
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
                justify-content: space-between;
            }

            .functionality-item {
                background-color: #495057;
                color: #e9ecef;
                padding: 30px;
                border-radius: 10px;
                width: 48%;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                transition: transform 0.3s ease, background-color 0.3s ease;
            }

            .functionality-item:hover {
                background-color: #6c757d;
                transform: scale(1.05);
            }

            .functionality-item a {
                color: #007bff;
                font-weight: 600;
                text-decoration: none;
                font-size: 1.2rem;
                display: block;
                margin-bottom: 10px;
                transition: color 0.3s ease;
            }

            .functionality-item a:hover {
                color: #ffffff;
            }

            /* Quote for each functionality */
            .quote {
                font-style: italic;
                color: #adb5bd;
                margin-top: 15px;
                font-size: 1.2rem;
            }

            /* Footer styles */
            a {
                font-size: 1rem;
                color: #007bff;
                text-decoration: none;
                margin-top: 20px;
                display: inline-block;
                padding: 12px;
                border-radius: 5px;
                background-color: #495057;
                transition: background-color 0.3s ease, color 0.3s ease;
            }

            a:hover {
                background-color: #007bff;
                color: white;
            }

            /* Responsive Design */
            @media (max-width: 768px) {
                .slidebar {
                    width: 220px;
                }

                .container {
                    margin-left: 220px;
                }

                .container h1 {
                    font-size: 2.5rem;
                }

                .functionality-item {
                    width: 100%;
                }
            }

        </style>

        <div class="slidebar">
            <button><a href="/add-event">Add Event</a></button>
            <button><a href="/edit-event">Edit Event</a></button>
            <button><a href="/delete-event">Delete Event</a></button>
            <button><a href="/view-registrations">View Registrations</a></button>
            <button><a href="/view-feedback">View Feedback</a></button>
            <button><a href="/view-events-organizer">View All Events</a></button>
        </div>
        
        <div class="container">
            <h1>Welcome, Organizer</h1>
            <h3>Your Dashboard</h3>
            
            <p class="quote">"Organizing events is not just about planning, it's about creating experiences."</p>
            
            <div class="functionality-box">
                <div class="functionality-item">
                    <a href="/add-event">Add Event</a>
                    <p class="quote">"A great event starts with a great idea." – Unknown</p>
                </div>

                <div class="functionality-item">
                    <a href="/edit-event">Edit Event</a>
                    <p class="quote">"Don’t be afraid to make changes, they may lead to something extraordinary." – Unknown</p>
                </div>
            </div>
            <br>
            <div class="functionality-box">
                <div class="functionality-item">
                    <a href="/delete-event">Delete Event</a>
                    <p class="quote">"Sometimes, the best way to move forward is to let go of the past." – Unknown</p>
                </div>
                <br>
                <div class="functionality-item">
                    <a href="/view-registrations">View Registrations</a>
                    <p class="quote">"The key to success is to focus on goals, not obstacles." – Unknown</p>
                </div>
            </div>
            <br>
            <div class="functionality-box">
                <div class="functionality-item">
                    <a href="/view-feedback">View Feedback</a>
                    <p class="quote">"Feedback is the breakfast of champions." – Ken Blanchard</p>
                </div>
                <br>
                <div class="functionality-item">
                    <a href="/view-events-organizer">View All Events</a>
                    <p class="quote">"The more you plan, the better you can execute." – Unknown</p>
                </div>
            </div>
            
            <a href="/logout">Logout</a>
        </div>
    `);
});




// Add Event (Organizer functionality)
app.get('/add-event', isLoggedIn, checkRole('organizer'), (req, res) => {
    res.send(`
        <style>
            /* Global Styles */
            body {
                font-family: 'Poppins', sans-serif;
                background-color: #1e1e2f;
                margin: 0;
                padding: 0;
                color: #ffffff;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                overflow: hidden;
            }

            /* Form Container */
            .form-container {
                background: linear-gradient(145deg, #2a2a3b, #1a1a2a);
                border-radius: 15px;
                padding: 40px;
                width: 400px;
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            /* Title Styles */
            h1 {
                font-size: 2rem;
                text-align: center;
                margin-bottom: 20px;
                color: #4fd1c5;
                text-shadow: 0px 4px 10px rgba(79, 209, 197, 0.5);
            }

            /* Input Fields */
            input {
                width: 100%;
                padding: 12px;
                margin: 10px 0;
                font-size: 1rem;
                border: none;
                border-radius: 8px;
                background: #2e2e3e;
                color: #ffffff;
                box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.3);
                transition: all 0.3s ease-in-out;
            }

            input:focus {
                outline: none;
                background: #3c3c4d;
                box-shadow: 0px 0px 8px #4fd1c5;
            }

            /* Submit Button */
            button {
                width: 100%;
                padding: 15px;
                margin-top: 20px;
                font-size: 1rem;
                font-weight: bold;
                border: none;
                border-radius: 8px;
                background: linear-gradient(90deg, #4fd1c5, #3c91e6);
                color: #ffffff;
                cursor: pointer;
                transition: all 0.4s ease;
                box-shadow: 0px 4px 10px rgba(79, 209, 197, 0.5);
            }

            button:hover {
                background: linear-gradient(90deg, #3c91e6, #4fd1c5);
                box-shadow: 0px 8px 20px rgba(79, 209, 197, 0.8);
                transform: translateY(-2px);
            }

            /* Additional Link Styles */
            a {
                color: #4fd1c5;
                text-decoration: none;
                font-weight: 500;
                margin-top: 10px;
                display: inline-block;
                transition: color 0.3s ease-in-out;
            }

            a:hover {
                color: #3c91e6;
            }

            /* Responsive Design */
            @media (max-width: 768px) {
                .form-container {
                    width: 90%;
                    padding: 20px;
                }

                h1 {
                    font-size: 1.8rem;
                }
            }
        </style>

        <div class="form-container">
            <h1>Add Event</h1>
            <form action="/add-event" method="POST">
                <input type="text" name="name" placeholder="Event Name" required />
                <input type="date" name="date" required />
                <input type="time" name="time" required />
                <input type="text" name="location" placeholder="Location" required />
                <input type="number" name="price" placeholder="Price" step="0.01" required />
                <button type="submit">Add Event</button>
            </form>
            <a href="/organizer">Back to Dashboard</a>
        </div>
    `);
});


app.post('/add-event', isLoggedIn, checkRole('organizer'), (req, res) => {
    const { name, date, time, location, price } = req.body;
    const organizerId = req.session.user.id; // Get the organizer's ID from session

    const query = 'INSERT INTO events (name, date, time, location, price, organizer_id) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [name, date, time, location, price, organizerId], (err) => {
        if (err) throw err;
        res.send(`
            <style>
                /* Global Styles */
                body {
                    font-family: 'Poppins', sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #1e1e2f;
                    color: #ffffff;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    overflow: hidden;
                }

                /* Success Popup Container */
                .popup-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;
                    background: linear-gradient(145deg, #2a2a3b, #1a1a2a);
                    padding: 40px;
                    border-radius: 15px;
                    width: 90%;
                    max-width: 500px;
                    box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.5);
                    animation: fadeIn 1s ease-in-out;
                }

                /* Title Styles */
                .popup-container h1 {
                    font-size: 2rem;
                    color: #4fd1c5;
                    text-shadow: 0px 4px 10px rgba(79, 209, 197, 0.5);
                    margin-bottom: 20px;
                }

                /* Description Text */
                .popup-container p {
                    font-size: 1rem;
                    color: #adb5bd;
                    text-align: center;
                    margin-bottom: 30px;
                }

                /* Button Styles */
                .popup-container a {
                    background: linear-gradient(90deg, #4fd1c5, #3c91e6);
                    padding: 12px 25px;
                    color: white;
                    font-weight: bold;
                    text-decoration: none;
                    border-radius: 8px;
                    box-shadow: 0px 4px 12px rgba(79, 209, 197, 0.5);
                    transition: all 0.4s ease;
                }

                .popup-container a:hover {
                    background: linear-gradient(90deg, #3c91e6, #4fd1c5);
                    box-shadow: 0px 8px 20px rgba(79, 209, 197, 0.8);
                    transform: scale(1.05);
                }

                /* Keyframes for Animation */
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.8);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .popup-container {
                        padding: 30px;
                        width: 90%;
                    }

                    .popup-container h1 {
                        font-size: 1.8rem;
                    }

                    .popup-container p {
                        font-size: 0.9rem;
                    }
                }
            </style>

            <div class="popup-container">
                <h1>Event Added Successfully</h1>
                <p>Your event "<strong>${name}</strong>" has been added successfully! You can now manage it from your dashboard.</p>
                <a href="/organizer">Go back to Dashboard</a>
            </div>
        `);
    });
});


app.get('/edit-event', isLoggedIn, checkRole('organizer'), (req, res) => {
    res.send(`
        <style>
            /* Global Styles */
            body {
                font-family: 'Poppins', sans-serif;
                margin: 0;
                padding: 0;
                background-color: #1e1e2f;
                color: #ffffff;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                overflow: hidden;
            }

            /* Container for Form */
            .form-container {
                background: linear-gradient(145deg, #2a2a3b, #1a1a2a);
                padding: 40px;
                border-radius: 15px;
                box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.5);
                width: 90%;
                max-width: 400px;
                animation: slideDown 0.8s ease-in-out;
            }

            .form-container h1 {
                font-size: 2rem;
                color: #4fd1c5;
                text-align: center;
                margin-bottom: 20px;
                text-shadow: 0px 4px 10px rgba(79, 209, 197, 0.5);
            }

            /* Input Fields */
            .form-container input {
                width: 100%;
                padding: 15px;
                margin: 15px 0;
                font-size: 1rem;
                border: none;
                border-radius: 8px;
                background-color: #2e2e3f;
                color: #ffffff;
                box-shadow: inset 0px 4px 8px rgba(0, 0, 0, 0.2);
                transition: all 0.3s ease;
            }

            .form-container input:focus {
                outline: none;
                box-shadow: 0 0 10px #4fd1c5;
                background-color: #3a3a4f;
            }

            /* Submit Button */
            .form-container button {
                width: 100%;
                padding: 15px;
                font-size: 1rem;
                font-weight: bold;
                color: white;
                background: linear-gradient(90deg, #4fd1c5, #3c91e6);
                border: none;
                border-radius: 8px;
                cursor: pointer;
                margin-top: 20px;
                box-shadow: 0px 8px 15px rgba(79, 209, 197, 0.5);
                transition: all 0.4s ease;
            }

            .form-container button:hover {
                transform: scale(1.05);
                box-shadow: 0px 12px 20px rgba(79, 209, 197, 0.8);
                background: linear-gradient(90deg, #3c91e6, #4fd1c5);
            }

            /* Link to Dashboard */
            .form-container a {
                display: block;
                margin-top: 20px;
                text-align: center;
                color: #4fd1c5;
                text-decoration: none;
                font-weight: bold;
                transition: color 0.3s ease;
            }

            .form-container a:hover {
                color: #3c91e6;
                text-shadow: 0px 4px 8px rgba(79, 209, 197, 0.5);
            }

            /* Animation for Form */
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* Responsive Design */
            @media (max-width: 768px) {
                .form-container {
                    padding: 30px;
                }

                .form-container h1 {
                    font-size: 1.8rem;
                }
            }
        </style>

        <div class="form-container">
            <h1>Edit Event</h1>
            <form action="/edit-event" method="POST">
                <input type="text" name="name" placeholder="Enter Event Name" required />
                <button type="submit">Find Event</button>
            </form>
            <a href="/organizer">Back to Dashboard</a>
        </div>
    `);
});

app.post('/edit-event', isLoggedIn, checkRole('organizer'), (req, res) => {
    const { name } = req.body;
    
    const query = 'SELECT * FROM events WHERE name = ? AND organizer_id = ?';
    db.query(query, [name, req.session.user.id], (err, results) => {
        if (err) throw err;
        if (results.length === 0) return res.send('Event not found.');

        const event = results[0];
        res.send(`
            <style>
                /* Global Styles */
                body {
                    font-family: 'Poppins', sans-serif;
                    margin: 0;
                    padding: 0;
                    background: linear-gradient(135deg, #1e1e2f, #232332);
                    color: #ffffff;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                }

                /* Container */
                .form-container {
                    background: linear-gradient(145deg, #2a2a3b, #1a1a2a);
                    padding: 30px 40px;
                    border-radius: 15px;
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
                    width: 90%;
                    max-width: 500px;
                    animation: fadeIn 0.8s ease-in-out;
                }

                .form-container h1 {
                    font-size: 2rem;
                    color: #4fd1c5;
                    text-align: center;
                    margin-bottom: 20px;
                    text-shadow: 0px 4px 10px rgba(79, 209, 197, 0.5);
                }

                /* Form Styles */
                form input {
                    width: 100%;
                    padding: 15px;
                    margin: 10px 0;
                    font-size: 1rem;
                    border: none;
                    border-radius: 8px;
                    background-color: #2e2e3f;
                    color: #ffffff;
                    box-shadow: inset 0px 4px 8px rgba(0, 0, 0, 0.2);
                    transition: all 0.3s ease;
                }

                form input:focus {
                    outline: none;
                    box-shadow: 0 0 10px #4fd1c5;
                    background-color: #3a3a4f;
                }

                form button {
                    width: 100%;
                    padding: 15px;
                    font-size: 1rem;
                    font-weight: bold;
                    color: white;
                    background: linear-gradient(90deg, #4fd1c5, #3c91e6);
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    margin-top: 20px;
                    box-shadow: 0px 8px 15px rgba(79, 209, 197, 0.5);
                    transition: all 0.4s ease;
                }

                form button:hover {
                    transform: scale(1.05);
                    box-shadow: 0px 12px 20px rgba(79, 209, 197, 0.8);
                    background: linear-gradient(90deg, #3c91e6, #4fd1c5);
                }

                /* Animation */
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* Link */
                .form-container a {
                    display: block;
                    text-align: center;
                    color: #4fd1c5;
                    text-decoration: none;
                    font-weight: bold;
                    margin-top: 20px;
                    transition: color 0.3s ease;
                }

                .form-container a:hover {
                    color: #3c91e6;
                    text-shadow: 0px 4px 8px rgba(79, 209, 197, 0.5);
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .form-container {
                        padding: 20px;
                    }
                    
                    .form-container h1 {
                        font-size: 1.8rem;
                    }
                }
            </style>

            <div class="form-container">
                <h1>Edit Event - ${event.name}</h1>
                <form action="/update-event" method="POST">
                    <input type="hidden" name="event_id" value="${event.id}" />
                    <input type="text" name="name" value="${event.name}" placeholder="Event Name" required />
                    <input type="date" name="date" value="${event.date}" required />
                    <input type="time" name="time" value="${event.time}" required />
                    <input type="text" name="location" value="${event.location}" placeholder="Location" required />
                    <input type="number" name="price" value="${event.price}" step="0.01" placeholder="Price" required />
                    <button type="submit">Update Event</button>
                </form>
                <a href="/organizer">Back to Dashboard</a>
            </div>
        `);
    });
});

app.post('/update-event', isLoggedIn, checkRole('organizer'), (req, res) => {
    const { event_id, name, date, time, location, price } = req.body;

    const query = 'UPDATE events SET name = ?, date = ?, time = ?, location = ?, price = ? WHERE id = ? AND organizer_id = ?';
    db.query(query, [name, date, time, location, price, event_id, req.session.user.id], (err) => {
        if (err) throw err;
        res.send(`
            <style>
                /* Global Styles */
                body {
                    font-family: 'Poppins', sans-serif;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background: linear-gradient(135deg, #1e1e2f, #232332);
                    color: #ffffff;
                    overflow: hidden;
                }

                .success-container {
                    text-align: center;
                    background: linear-gradient(145deg, #2a2a3b, #1a1a2a);
                    padding: 40px 60px;
                    border-radius: 20px;
                    box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.4);
                    animation: fadeIn 0.8s ease-in-out;
                }

                h1 {
                    font-size: 2.5rem;
                    color: #4fd1c5;
                    text-shadow: 0px 5px 10px rgba(79, 209, 197, 0.5);
                    margin-bottom: 20px;
                    animation: slideDown 1s ease-in-out;
                }

                p {
                    font-size: 1.2rem;
                    line-height: 1.6;
                    color: #b0b0c5;
                }

                a {
                    display: inline-block;
                    margin-top: 20px;
                    padding: 15px 30px;
                    font-size: 1rem;
                    font-weight: bold;
                    color: #ffffff;
                    background: linear-gradient(90deg, #4fd1c5, #3c91e6);
                    border: none;
                    border-radius: 8px;
                    text-decoration: none;
                    box-shadow: 0px 8px 15px rgba(79, 209, 197, 0.5);
                    transition: all 0.4s ease;
                }

                a:hover {
                    background: linear-gradient(90deg, #3c91e6, #4fd1c5);
                    transform: scale(1.05);
                    box-shadow: 0px 12px 20px rgba(79, 209, 197, 0.8);
                }

                /* Animations */
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* Background Animation */
                @keyframes gradientMove {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }

                body {
                    background: linear-gradient(135deg, #1e1e2f, #232332, #1e1e2f);
                    background-size: 300% 300%;
                    animation: gradientMove 6s ease infinite;
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .success-container {
                        padding: 30px 20px;
                    }

                    h1 {
                        font-size: 2rem;
                    }

                    p {
                        font-size: 1rem;
                    }

                    a {
                        font-size: 0.9rem;
                        padding: 12px 25px;
                    }
                }
            </style>
            <div class="success-container">
                <h1>Event Updated Successfully</h1>
                <p>Your event has been successfully updated. Click below to return to the dashboard and manage your events.</p>
                <a href="/organizer">Go Back to Dashboard</a>
            </div>
        `);
    });
});


app.get('/delete-event', isLoggedIn, checkRole('organizer'), (req, res) => {
    const organizerId = req.session.user.id;

    // Fetch all events created by the logged-in organizer
    const query = 'SELECT * FROM events WHERE organizer_id = ?';
    db.query(query, [organizerId], (err, events) => {
        if (err) {
            console.log("Error fetching events:", err);
            return res.status(500).send('Error fetching events');
        }

        if (events.length === 0) {
            return res.send('<h1>No events found to delete</h1>');
        }

        // Create options for the dropdown with event names
        let eventOptions = events.map(event => `<option value="${event.id}">${event.name}</option>`).join('');
        
        res.send(`
            <style>
                /* Global Styles */
                body {
                    font-family: 'Poppins', sans-serif;
                    margin: 0;
                    padding: 0;
                    background: linear-gradient(135deg, #1e1e2f, #2a2a3b);
                    color: #ffffff;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                }

                .form-container {
                    width: 100%;
                    max-width: 500px;
                    background: linear-gradient(145deg, #232332, #1a1a2a);
                    border-radius: 15px;
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
                    padding: 30px 40px;
                    animation: fadeIn 0.8s ease-in-out;
                    color: #e0e0e0;
                }

                h1 {
                    text-align: center;
                    font-size: 2rem;
                    margin-bottom: 20px;
                    color: #4fd1c5;
                    text-shadow: 0 4px 6px rgba(79, 209, 197, 0.5);
                }

                label {
                    font-size: 1rem;
                    color: #c4c4dc;
                    margin-bottom: 10px;
                    display: block;
                }

                select {
                    width: 100%;
                    padding: 12px;
                    margin-bottom: 20px;
                    font-size: 1rem;
                    color: #ffffff;
                    background: #2e2e3d;
                    border: 1px solid #4fd1c5;
                    border-radius: 8px;
                    outline: none;
                    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
                    transition: all 0.3s ease;
                }

                select:hover,
                select:focus {
                    border-color: #3c91e6;
                    box-shadow: 0px 8px 16px rgba(79, 209, 197, 0.3);
                }

                button {
                    width: 100%;
                    padding: 15px;
                    font-size: 1rem;
                    font-weight: bold;
                    color: #ffffff;
                    background: linear-gradient(90deg, #dc3545, #c82333);
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    box-shadow: 0 6px 12px rgba(220, 53, 69, 0.5);
                    transition: all 0.3s ease;
                }

                button:hover {
                    background: linear-gradient(90deg, #c82333, #dc3545);
                    transform: scale(1.05);
                    box-shadow: 0 10px 20px rgba(220, 53, 69, 0.8);
                }

                /* Fade-in Animation */
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .form-container {
                        padding: 20px 30px;
                    }

                    h1 {
                        font-size: 1.8rem;
                    }
                }
            </style>
            <div class="form-container">
                <h1>Delete Event</h1>
                <form action="/delete-event" method="POST">
                    <label for="eventId">Select Event:</label>
                    <select name="eventId" id="eventId" required>
                        <option value="" disabled selected>Select an event</option>
                        ${eventOptions}
                    </select>
                    <button type="submit">Delete Event</button>
                </form>
            </div>
        `);
    });
});


app.post('/delete-event', isLoggedIn, checkRole('organizer'), (req, res) => {
    const { eventId } = req.body;
    const organizerId = req.session.user.id;

    // Step 1: Check if the event exists and belongs to the logged-in organizer
    const checkEventQuery = 'SELECT * FROM events WHERE id = ? AND organizer_id = ?';
    db.query(checkEventQuery, [eventId, organizerId], (err, event) => {
        if (err) {
            console.error("Error checking event:", err);
            return res.status(500).send('Error checking event');
        }

        if (event.length === 0) {
            return res.status(404).send('Event not found or you are not the organizer');
        }

        // Step 2: Delete related bookings
        const deleteBookingsQuery = 'DELETE FROM bookings WHERE event_id = ?';
        db.query(deleteBookingsQuery, [eventId], (err) => {
            if (err) {
                console.error("Error deleting bookings:", err);
                return res.status(500).send('Error deleting bookings');
            }

            // Step 3: Delete the event
            const deleteEventQuery = 'DELETE FROM events WHERE id = ?';
            db.query(deleteEventQuery, [eventId], (err) => {
                if (err) {
                    console.error("Error deleting event:", err);
                    return res.status(500).send('Error deleting event');
                }

                res.send(`
                    <style>
                        /* Global Styles */
                        body {
                            font-family: 'Poppins', sans-serif;
                            margin: 0;
                            padding: 0;
                            background: linear-gradient(135deg, #1e1e30, #2b2b45);
                            color: #ffffff;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                        }

                        .container {
                            text-align: center;
                            max-width: 500px;
                            background: linear-gradient(145deg, #232341, #1a1a35);
                            padding: 40px;
                            border-radius: 15px;
                            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
                            animation: fadeIn 0.8s ease-in-out;
                        }

                        h1 {
                            font-size: 2rem;
                            color: #4fd1c5;
                            text-shadow: 0 4px 6px rgba(79, 209, 197, 0.5);
                            margin-bottom: 20px;
                        }

                        p {
                            font-size: 1.1rem;
                            color: #d1d1e0;
                            margin-bottom: 20px;
                        }

                        a {
                            display: inline-block;
                            margin-top: 20px;
                            padding: 12px 20px;
                            font-size: 1rem;
                            font-weight: bold;
                            color: #ffffff;
                            background: linear-gradient(90deg, #28a745, #218838);
                            border-radius: 8px;
                            text-decoration: none;
                            box-shadow: 0 6px 12px rgba(40, 167, 69, 0.5);
                            transition: all 0.3s ease;
                        }

                        a:hover {
                            background: linear-gradient(90deg, #218838, #28a745);
                            transform: scale(1.05);
                            box-shadow: 0 10px 20px rgba(40, 167, 69, 0.8);
                        }

                        /* Animation */
                        @keyframes fadeIn {
                            from {
                                opacity: 0;
                                transform: scale(0.9);
                            }
                            to {
                                opacity: 1;
                                transform: scale(1);
                            }
                        }

                        /* Responsive Design */
                        @media (max-width: 768px) {
                            .container {
                                padding: 20px;
                            }

                            h1 {
                                font-size: 1.8rem;
                            }

                            p {
                                font-size: 1rem;
                            }

                            a {
                                padding: 10px 15px;
                                font-size: 0.9rem;
                            }
                        }
                    </style>

                    <div class="container">
                        <h1>Event Deleted Successfully</h1>
                        <p>Your event has been successfully deleted along with its bookings.</p>
                        <a href="/organizer">Go Back to Dashboard</a>
                    </div>
                `);
            });
        });
    });
});

// View All Events for Organizer
app.get('/view-events-organizer', isLoggedIn, checkRole('organizer'), (req, res) => {
    const query = 'SELECT * FROM events WHERE organizer_id = ?';
    db.query(query, [req.session.user.id], (err, results) => {
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
                        <a href="/view-feedback/${event.id}">View Feedback</a>
                        <a href="/edit-event?id=${event.id}">Edit</a>
                        <a href="/delete-event?id=${event.id}" class="delete">Delete</a>
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
                <title>Organizer Events</title>
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

                    .actions a.delete {
                        background: linear-gradient(135deg, #e74c3c, #c0392b);
                    }

                    .actions a.delete:hover {
                        background: linear-gradient(135deg, #c0392b, #e74c3c);
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
                <h1>All Your Events</h1>
                ${eventsList}
                <a href="/organizer" class="back">Back to Dashboard</a>
            </body>
            </html>
        `);
    });
});
