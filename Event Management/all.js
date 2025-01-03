const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(
    session({
        secret: 'secret',
        resave: false,
        saveUninitialized: true,
    })
);

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '', // Update with your MySQL password
    database: 'event_management3',
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL Server');
});

// Middleware for checking if a user is logged in
function isLoggedIn(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
}


// Middleware for role checking
function checkRole(role) {
    return (req, res, next) => {
        if (req.session.user && req.session.user.role === role) {
            return next();
        }
        res.send("Unauthorized access.");
    };
}

// Serve static files from the 'public' folder
app.use('/public', express.static(path.join(__dirname, 'public')));


// User Registration
app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    
    // Check if user already exists
    const checkUserQuery = 'SELECT * FROM users WHERE username = ?';
    db.query(checkUserQuery, [username], async (err, results) => {
        if (err) throw err;
        
        if (results.length > 0) {
            // User already exists
            return res.send("User already exists. Please try with a different username.");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
        db.query(query, [username, hashedPassword, role], (err) => {
            if (err) throw err;
            res.send(`
                <style>
                    /* Global Styles */
                    body {
                        font-family: 'Poppins', sans-serif;
                        background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
                        color: #f0f0f0;
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        overflow: hidden;
                        animation: fadeIn 1.5s ease-in-out;
                    }

                    @keyframes fadeIn {
                        0% { opacity: 0; transform: translateY(-10px); }
                        100% { opacity: 1; transform: translateY(0); }
                    }

                    /* Fullscreen Overlay and Popup */
                    .overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-color: rgba(0, 0, 0, 0.7);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        opacity: 0;
                        visibility: hidden;
                        transition: opacity 0.3s ease-in-out;
                    }

                    .overlay.show {
                        opacity: 1;
                        visibility: visible;
                    }

                    .popup {
                        background-color: #1c3d4a; /* Dark background */
                        padding: 40px;
                        border-radius: 8px;
                        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
                        text-align: center;
                        max-width: 400px;
                        width: 100%;
                        animation: popupAnimation 0.4s ease-out;
                    }

                    .popup h1 {
                        font-size: 2rem;
                        color: #4fd1c5;
                        margin-bottom: 20px;
                        text-shadow: 0 4px 8px rgba(79, 209, 197, 0.5);
                    }

                    .popup p {
                        font-size: 1.2rem;
                        color: #d1d1d1;
                    }

                    .popup a {
                        font-size: 1.1rem;
                        color: #74b9ff;
                        text-decoration: none;
                        font-weight: bold;
                    }

                    .popup a:hover {
                        text-decoration: underline;
                    }

                    /* Popup Animation */
                    @keyframes popupAnimation {
                        0% {
                            transform: scale(0.8);
                            opacity: 0;
                        }
                        100% {
                            transform: scale(1);
                            opacity: 1;
                        }
                    }

                    /* Close button */
                    .popup button {
                        background-color: #4fd1c5;
                        color: white;
                        padding: 12px 20px;
                        border: none;
                        border-radius: 5px;
                        font-size: 1.1rem;
                        cursor: pointer;
                        margin-top: 20px;
                        transition: background-color 0.3s ease;
                    }

                    .popup button:hover {
                        background-color: #38b2ac;
                    }

                    /* Responsive Design */
                    @media (max-width: 768px) {
                        .popup {
                            width: 90%;
                            padding: 20px;
                        }
                    }
                </style>

                <div class="overlay show" id="popup-overlay">
                    <div class="popup">
                        <h1>Registration Successful</h1>
                        <p>You can now <a href="/login">Login</a></p>
                        <button onclick="closePopup()">Close</button>
                    </div>
                </div>

                <script>
                    // Function to close the popup after clicking the close button
                    function closePopup() {
                        document.getElementById('popup-overlay').classList.remove('show');
                    }
                </script>
            `);
        });
    });
});


// User Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], async (err, results) => {
        if (err) throw err;
        if (results.length === 0) return res.send('Invalid username or password');

        const user = results[0];
        const match = await bcrypt.compare(password, user.password); // Compare the hashed password
        if (!match) return res.send('Invalid username or password');

        req.session.user = { id: user.id, username: user.username, role: user.role };

        // Redirect based on role
        if (user.role === 'organizer') {
            res.redirect('/organizer');
        } else if (user.role === 'attendee') {
            res.redirect('/attendee');
        }
    });
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});


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


// Home route
// Home route
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Club Event Management System</title>
            <style>
                /* General Styling */
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Poppins', sans-serif;
                    background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    text-align: center;
                    overflow: hidden;
                }

                /* Animated Header */
                h1 {
                    font-size: 3rem;
                    color: #4fc3f7;
                    text-transform: uppercase;
                    margin: 20px 0;
                    position: relative;
                    animation: glow 1.5s infinite alternate;
                }

                @keyframes glow {
                    from {
                        text-shadow: 0 0 5px #4fc3f7, 0 0 10px #4fc3f7, 0 0 20px #4fc3f7;
                    }
                    to {
                        text-shadow: 0 0 20px #4fc3f7, 0 0 30px #4fc3f7, 0 0 50px #4fc3f7;
                    }
                }

                /* Moving Letters Animation */
                h1 span {
                    display: inline-block;
                    animation: move 2s infinite alternate;
                }

                h1 span:nth-child(1) { animation-delay: 0.1s; }
                h1 span:nth-child(2) { animation-delay: 0.2s; }
                h1 span:nth-child(3) { animation-delay: 0.3s; }
                h1 span:nth-child(4) { animation-delay: 0.4s; }
                h1 span:nth-child(5) { animation-delay: 0.5s; }

                @keyframes move {
                    from {
                        transform: translateY(0px);
                    }
                    to {
                        transform: translateY(-10px);
                    }
                }

                h4 {
                    font-size: 1.5rem;
                    color: #e0e0e0;
                    margin-bottom: 30px;
                    text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
                }

                /* Button Container */
                .button-container {
                    display: flex;
                    gap: 20px;
                }

                /* Button Styling */
                .btn {
                    padding: 12px 25px;
                    font-size: 1rem;
                    text-decoration: none;
                    color: #fff;
                    background: linear-gradient(135deg, #4fc3f7, #38b2ac);
                    border: none;
                    border-radius: 8px;
                    box-shadow: 0 5px 15px rgba(79, 195, 247, 0.4);
                    transition: all 0.3s ease;
                }

                .btn:hover {
                    background: linear-gradient(135deg, #38b2ac, #4fc3f7);
                    transform: scale(1.1);
                    box-shadow: 0 10px 30px rgba(79, 195, 247, 0.7);
                }

                .btn:active {
                    transform: scale(1.05);
                }

                /* Particle Animation */
                .particle {
                    position: absolute;
                    background-color: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    pointer-events: none;
                    animation: particle-move 5s infinite linear;
                }

                @keyframes particle-move {
                    from {
                        transform: translateY(0) translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateY(-800px) translateX(calc(-50px + 100px * random()));
                        opacity: 0;
                    }
                }

                /* Random Particle Generator */
                .particle:nth-child(odd) {
                    width: 5px;
                    height: 5px;
                    animation-duration: 6s;
                }

                .particle:nth-child(even) {
                    width: 8px;
                    height: 8px;
                    animation-duration: 8s;
                }

                @media (max-width: 768px) {
                    h1 {
                        font-size: 2rem;
                    }
                    h4 {
                        font-size: 1.2rem;
                    }
                    .btn {
                        font-size: 0.9rem;
                        padding: 10px 20px;
                    }
                }
            </style>
        </head>
        <body>
            <h1>
                <span>W</span><span>e</span><span>l</span><span>c</span><span>o</span><span>m</span><span>e</span>
            </h1>
            <h4>Discover a smarter way to manage events with our seamless platform.</h4>
            <div class="button-container">
                <a href="/login" class="btn">Login</a>
                <a href="/register" class="btn">Register</a>
            </div>

            <!-- Particle Animation -->
            ${Array.from({ length: 50 }, () => `<div class="particle"></div>`).join('')}
        </body>
        </html>
    `);
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



// User Login Page
app.get('/login', (req, res) => {
    res.send(`
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login</title>
            <style>
                /* General Styling */
                body {
                    font-family: 'Poppins', sans-serif;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
                    color: #f0f0f0;
                    animation: fadeIn 2s ease-in-out;
                }

                @keyframes fadeIn {
                    0% { opacity: 0; transform: translateY(-10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }

                .login-container {
                    background-color: #1c3d4a; /* Dark background for the form */
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
                    width: 100%;
                    max-width: 400px;
                    text-align: center;
                    animation: glow 1.5s infinite alternate;
                }

                @keyframes glow {
                    from { box-shadow: 0 4px 10px rgba(79, 209, 197, 0.5); }
                    to { box-shadow: 0 8px 20px rgba(79, 209, 197, 0.8); }
                }

                h1 {
                    font-size: 3rem;
                    margin-bottom: 20px;
                    color: #4fd1c5;
                    text-shadow: 0 4px 8px rgba(79, 209, 197, 0.5);
                    animation: moveLetters 2s ease-in-out infinite alternate;
                }

                @keyframes moveLetters {
                    0% { transform: translateX(-10px); }
                    50% { transform: translateX(10px); }
                    100% { transform: translateX(-10px); }
                }

                input {
                    width: 100%;
                    padding: 12px;
                    margin: 10px 0;
                    border: 1px solid #4fd1c5;
                    border-radius: 5px;
                    background-color: #2c5364;
                    color: #f0f0f0;
                    font-size: 16px;
                    box-sizing: border-box;
                }

                input[type="text"], input[type="password"] {
                    background-color: #2c5364; /* Matching background */
                }

                button {
                    width: 100%;
                    padding: 12px;
                    background-color: #4fd1c5;
                    border: none;
                    color: white;
                    font-size: 16px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 10px;
                    transition: background-color 0.3s ease;
                }

                button:hover {
                    background-color: #38b2ac;
                }

                a {
                    display: block;
                    text-align: center;
                    margin-top: 15px;
                    font-size: 14px;
                    color: #4fd1c5;
                    text-decoration: none;
                    transition: color 0.3s ease;
                }

                a:hover {
                    color: #38b2ac;
                    text-decoration: underline;
                }

                /* Inspirational Quotes Styling */
                .quote {
                    margin-top: 30px;
                    font-size: 1.5rem;
                    font-style: italic;
                    color: #d1d1d1;
                    opacity: 0;
                    animation: fadeInQuote 5s ease-in-out infinite;
                }

                @keyframes fadeInQuote {
                    0% { opacity: 0; }
                    50% { opacity: 1; }
                    100% { opacity: 0; }
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    h1 { font-size: 2rem; }
                    input, button { font-size: 14px; }
                    .quote { font-size: 1.2rem; }
                }
            </style>
        </head>
        <body>
            <div class="login-container">
                <h1>Login</h1>
                <form action="/login" method="POST">
                    <input type="text" name="username" placeholder="Username" required />
                    <input type="password" name="password" placeholder="Password" required />
                    <button type="submit">Login</button>
                </form>
                <a href="/register">Don't have an account? Register here</a>
                <div class="quote">"The only way to do great work is to love what you do." - Steve Jobs</div>
            </div>
        </body>
        </html>
    `);
});


// User Registration Page
app.get('/register', (req, res) => {
    res.send(`
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Register</title>
            <style>
                /* General Styling */
                body {
                    font-family: 'Poppins', sans-serif;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
                    color: #f0f0f0;
                    animation: fadeIn 2s ease-in-out;
                }

                @keyframes fadeIn {
                    0% { opacity: 0; transform: translateY(-10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }

                .register-container {
                    background-color: #1c3d4a; /* Dark background for the form */
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
                    width: 100%;
                    max-width: 400px;
                    text-align: center;
                    animation: glow 1.5s infinite alternate;
                }

                @keyframes glow {
                    from { box-shadow: 0 4px 10px rgba(79, 209, 197, 0.5); }
                    to { box-shadow: 0 8px 20px rgba(79, 209, 197, 0.8); }
                }

                h1 {
                    font-size: 3rem;
                    margin-bottom: 20px;
                    color: #4fd1c5;
                    text-shadow: 0 4px 8px rgba(79, 209, 197, 0.5);
                    animation: moveLetters 2s ease-in-out infinite alternate;
                }

                @keyframes moveLetters {
                    0% { transform: translateX(-10px); }
                    50% { transform: translateX(10px); }
                    100% { transform: translateX(-10px); }
                }

                input, select {
                    width: 100%;
                    padding: 12px;
                    margin: 10px 0;
                    border: 1px solid #4fd1c5;
                    border-radius: 5px;
                    background-color: #2c5364;
                    color: #f0f0f0;
                    font-size: 16px;
                    box-sizing: border-box;
                }

                input[type="text"], input[type="password"], select {
                    background-color: #2c5364;
                }

                button {
                    width: 100%;
                    padding: 12px;
                    background-color: #4fd1c5;
                    border: none;
                    color: white;
                    font-size: 16px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 10px;
                    transition: background-color 0.3s ease;
                }

                button:hover {
                    background-color: #38b2ac;
                }

                a {
                    display: block;
                    text-align: center;
                    margin-top: 15px;
                    font-size: 14px;
                    color: #4fd1c5;
                    text-decoration: none;
                    transition: color 0.3s ease;
                }

                a:hover {
                    color: #38b2ac;
                    text-decoration: underline;
                }

                /* Inspirational Quotes Styling */
                .quote {
                    margin-top: 30px;
                    font-size: 1.5rem;
                    font-style: italic;
                    color: #d1d1d1;
                    opacity: 0;
                    animation: fadeInQuote 5s ease-in-out infinite;
                }

                @keyframes fadeInQuote {
                    0% { opacity: 0; }
                    50% { opacity: 1; }
                    100% { opacity: 0; }
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    h1 { font-size: 2rem; }
                    input, button { font-size: 14px; }
                    .quote { font-size: 1.2rem; }
                }
            </style>
        </head>
        <body>
            <div class="register-container">
                <h1>Register</h1>
                <form action="/register" method="POST">
                    <input type="text" name="username" placeholder="Username" required />
                    <input type="password" name="password" placeholder="Password" required />
                    <select name="role" required>
                        <option value="organizer">Organizer</option>
                        <option value="attendee">Attendee</option>
                    </select>
                    <button type="submit">Register</button>
                </form>
                <a href="/login">Already have an account? Log in here</a>
                <div class="quote">"Why not? You are just one click away from greatness!"</div>
                <div class="quote">"Let’s make registration as easy as possible—because who has time for hard stuff?"</div>
            </div>
        </body>
        </html>
    `);
});





// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
