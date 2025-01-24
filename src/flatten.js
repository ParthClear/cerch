function flattenJSON(obj, parentKey = '') {
    let result = {};

    for (const [key, value] of Object.entries(obj)) {
		if ( value === '' )
			continue;
		if(key.substring(0,2) === '**')
			continue;
        const newKey = parentKey ? `${parentKey} ${key}` : key;
        if (typeof value === 'object' && value !== null  && !Array.isArray(value)) {
            Object.assign(result, flattenJSON(value, newKey));
        } else {
            result[newKey] = value;
        }
    }

    return result;
}
const fs = require('fs');
const path = require('path');

// Read JSON from a file
const filePath = path.join(__dirname, 'data.json'); // Replace with your file name

fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }

    try {
        const jsonData = JSON.parse(data); // Parse the JSON
        const flattenedJSON = flattenJSON(jsonData); // Flatten the JSON
        console.log(flattenedJSON); // Output the flattened JSON

        // Optional: Write the flattened JSON back to a new file
        const outputFilePath = path.join(__dirname, 'flattened.json');
        fs.writeFile(outputFilePath, JSON.stringify(flattenedJSON, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Error writing the flattened JSON to file:', writeErr);
            } else {
                console.log('Flattened JSON saved to flattened.json');
            }
        });
    } catch (parseErr) {
        console.error('Error parsing JSON:', parseErr);
    }
});

