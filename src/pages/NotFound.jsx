import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1a1a1a',
      color: 'white',
      textAlign: 'center',
      padding: '2rem',
    },
    title: {
      fontSize: '5rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
    },
    message: {
      fontSize: '1.5rem',
      marginBottom: '2rem',
    },
    button: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#2563eb',
      color: 'white',
      textDecoration: 'none',
      fontWeight: 'bold',
      borderRadius: '0.5rem',
      transition: 'background-color 0.3s ease',
      cursor: 'pointer',
      border: 'none',
      display: 'inline-block',
    },
  };

  // For hover effect with inline styles, React doesn't support it directly.
  // So we can add a simple workaround using state:

  const [hover, setHover] = React.useState(false);

  const buttonStyle = {
    ...styles.button,
    backgroundColor: hover ? '#1d4ed8' : '#2563eb',
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>404</h1>
      <p style={styles.message}>Page Not Found</p>
      <Link
        to="/"
        style={buttonStyle}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
