let currentPage = 1;
let linesPerPage = 10;
let csvArray = [];
let headers = []; // Separately store headers
let sortDirection = 'asc';
let currentSortColumn = null;

document.getElementById('linesToShow').addEventListener('change', function () {
    linesPerPage = parseInt(this.value);
    currentPage = 1; // Reset to the first page
    displayPage();
});

const googleSheetsURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSg_faHZtlc9buzDHFCc-lv8R3GnCzcnDuQbEWMDxBJnBY8byLZ2bLX5xviBy5TJLEivB-7QLG0fEhS/pub?output=csv';

function loadDataFromGoogleSheets() {
    fetch(googleSheetsURL)
        .then(response => response.text())
        .then(csv => {
            const allRows = csv.split(/\r\n|\n/).map(line => line.split(','));
            headers = allRows[0]; // Store headers
            csvArray = allRows.slice(1); // Exclude header from data
            displayPage();
        })
        .catch(error => console.error('Error loading the Google Sheets data:', error));
}

function displayPage() {
    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    const columnsToHide = ['Link', 'Timestamp']; // Names of the columns to hide

    // Function to check if a column should be hidden
    const shouldHideColumn = (header) => columnsToHide.includes(header);

    // Filtered indexes of columns to hide
    const indexesToHide = headers.reduce((acc, header, index) => {
        if (shouldHideColumn(header)) acc.push(index);
        return acc;
    }, []);

    headers.forEach((header, index) => {
        if (!shouldHideColumn(header)) { // Only add header if it's not in the list of columns to hide
            const headerCell = document.createElement('th');
            headerCell.textContent = header;
            if (index === currentSortColumn) {
                headerCell.textContent += sortDirection === 'asc' ? ' ↑' : ' ↓';
            }
            headerCell.onclick = () => sortColumn(index);
            headerRow.appendChild(headerCell);
        }
    });
    table.appendChild(headerRow);

    const startIndex = (currentPage - 1) * linesPerPage;
    const endIndex = startIndex + linesPerPage;
    csvArray.slice(startIndex, endIndex).forEach(row => {
        const rowElement = document.createElement('tr');
        row.forEach((cell, index) => {
            if (!indexesToHide.includes(index)) { // Only add cell if its column is not to be hidden
                const cellElement = document.createElement('td');
                cellElement.textContent = cell;
                rowElement.appendChild(cellElement);
            }
        });
        table.appendChild(rowElement);
    });

    document.getElementById('csvRoot').innerHTML = '';
    document.getElementById('csvRoot').appendChild(table);
}

function sortColumn(columnIndex) {
    if (columnIndex === currentSortColumn) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortDirection = 'asc';
        currentSortColumn = columnIndex;
    }

    csvArray.sort((a, b) => {
        let valueA = a[columnIndex];
        let valueB = b[columnIndex];

        // Check if the values are numeric and convert them if they are
        if (!isNaN(valueA) && !isNaN(valueB)) {
            valueA = parseFloat(valueA);
            valueB = parseFloat(valueB);
        } else {
            // If values are not numeric, compare them as lowercase strings to ensure case-insensitive comparison
            valueA = valueA.toLowerCase();
            valueB = valueB.toLowerCase();
        }

        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    displayPage();
}


function navigate(direction) {
    const totalPages = Math.ceil(csvArray.length / linesPerPage);
    currentPage += direction;
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;
    displayPage();
}
