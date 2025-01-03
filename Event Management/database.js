const mysql = require('mysql');

// Create a connection to the database
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '', // Replace with your MySQL password
    database: 'event_management3', // Make sure this database exists
});

// Connect to the database
db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to MySQL Server');
    
    // SQL queries to create the tables
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            role ENUM('organizer', 'attendee') NOT NULL
        );
    `;

    const createEventsTable = `
        CREATE TABLE IF NOT EXISTS events (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            date DATE NOT NULL,
            time TIME NOT NULL,
            location VARCHAR(255) NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            organizer_id INT,
            FOREIGN KEY (organizer_id) REFERENCES users(id)
        );
    `;

    const createRegistrationsTable = `
        CREATE TABLE IF NOT EXISTS registrations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            event_id INT NOT NULL,
            attendee_id INT NOT NULL,
            payment_status ENUM('paid', 'unpaid') NOT NULL,
            FOREIGN KEY (event_id) REFERENCES events(id),
            FOREIGN KEY (attendee_id) REFERENCES users(id)
        );
    `;

     // Create 'bookings' table if it doesn't exist
     const createBookingsTable = `
     CREATE TABLE IF NOT EXISTS bookings (
         id INT AUTO_INCREMENT PRIMARY KEY,
         user_id INT NOT NULL,
         event_id INT NOT NULL,
         tickets INT NOT NULL,
         total_amount DECIMAL(10, 2) NOT NULL,
         status VARCHAR(50) NOT NULL,
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
         FOREIGN KEY (event_id) REFERENCES events(id),
         FOREIGN KEY (user_id) REFERENCES users(id)
     );
 `;
 
 db.query(createBookingsTable, (err, result) => {
     if (err) {
         console.error('Error creating bookings table:', err);
     } else {
         console.log('Bookings table created or already exists.');
     }
 });


    // Create Feedback Table
    const createFeedbackTable = `
    CREATE TABLE IF NOT EXISTS feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id INT NOT NULL,
        user_id INT NOT NULL,
        feedback_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;

    // Execute all the queries to create the tables
    db.query(createBookingsTable, (err, result) => {
        if (err) {
            console.error('Error creating bookings table:', err);
            return;
        }
        console.log('Bookings table created or already exists.');
    });

    db.query(createUsersTable, (err, result) => {
        if (err) {
            console.error('Error creating users table:', err);
            return;
        }
        console.log('Users table created successfully');
    });

    db.query(createEventsTable, (err, result) => {
        if (err) {
            console.error('Error creating events table:', err);
            return;
        }
        console.log('Events table created successfully');
    });

    db.query(createRegistrationsTable, (err, result) => {
        if (err) {
            console.error('Error creating registrations table:', err);
            return;
        }
        console.log('Registrations table created successfully');
    });

    db.query(createFeedbackTable, (err, result) => {
        if (err) {
            console.error('Error creating feedback table:', err);
            return;
        }
        console.log('Feedback table created successfully');
    });

    // Close the connection once all queries are executed
    db.end(err => {
        if (err) {
            console.error('Error closing the database connection:', err);
            return;
        }
        console.log('Database connection closed');
    });
});
