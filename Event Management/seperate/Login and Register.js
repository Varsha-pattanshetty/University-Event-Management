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
