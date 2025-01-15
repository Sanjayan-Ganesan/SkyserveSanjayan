const { render, screen } = require('@testing-library/react');
const App = require('./App'); // Adjust the import based on your actual App component location

test('renders geospatial application', () => {
	render(<App />);
	const linkElement = screen.getByText(/geospatial/i);
	expect(linkElement).toBeInTheDocument();
});