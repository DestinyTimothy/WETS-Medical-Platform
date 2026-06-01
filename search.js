/**
 * WETS - Patient Search Page
 * Interactive search and selection functionality
 */

let selectedPatientId = '222'; // Default initialization parameter

// Select a table row
function selectRow(row) {
    if (!row) return;

    // Isolate active classes across dataset items
    const allRows = document.querySelectorAll('.table-row');
    allRows.forEach(r => r.classList.remove('selected'));
    
    // Establish active selection states
    row.classList.add('selected');
    selectedPatientId = row.getAttribute('data-patient-id');
}

// Perform client-side data queries
function performSearch() {
    const searchField = document.getElementById('searchField').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (!searchTerm) {
        alert('Please enter a search term');
        return;
    }
    
    const rows = document.querySelectorAll('.table-row');
    let foundCount = 0;
    let firstVisibleRow = null;
    
    rows.forEach(row => {
        const patientId = row.querySelector('td:nth-child(1)').textContent.toLowerCase();
        const patientName = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
        const department = row.querySelector('.dept-tag').textContent.toLowerCase();
        
        let shouldShow = false;
        
        switch(searchField) {
            case 'name':
                shouldShow = patientName.includes(searchTerm);
                break;
            case 'id':
                shouldShow = patientId.includes(searchTerm);
                break;
            case 'department':
                shouldShow = department.includes(searchTerm);
                break;
            default:
                shouldShow = patientName.includes(searchTerm) || 
                             patientId.includes(searchTerm) || 
                             department.includes(searchTerm);
        }
        
        if (shouldShow) {
            row.style.display = '';
            foundCount++;
            if (!firstVisibleRow) firstVisibleRow = row;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Update records interface badge text
    const recordsBadge = document.querySelector('.records-badge');
    if (recordsBadge) {
        recordsBadge.textContent = `${foundCount} RECORD${foundCount !== 1 ? 'S' : ''}`;
    }

    // Automatically shift active focus to top matched record if current selection hides
    if (firstVisibleRow) {
        selectRow(firstVisibleRow);
    }
}

// Delete runtime instances from table stream matrix
function deleteSelected() {
    if (!selectedPatientId) {
        alert('Please select a patient to delete');
        return;
    }
    
    const confirmDelete = confirm(`Are you sure you want to delete patient ID ${selectedPatientId}?`);
    if (!confirmDelete) return;

    const selectedRow = document.querySelector(`.table-row[data-patient-id="${selectedPatientId}"]`);
    if (selectedRow) {
        selectedRow.style.transition = 'all 0.4s ease';
        selectedRow.style.opacity = '0';
        selectedRow.style.transform = 'translateX(-15px)';
        
        setTimeout(() => {
            selectedRow.remove();
            
            const remainingRows = Array.from(document.querySelectorAll('.table-row')).filter(r => r.style.display !== 'none');
            const recordsBadge = document.querySelector('.records-badge');
            
            if (recordsBadge) {
                recordsBadge.textContent = `${remainingRows.length} RECORD${remainingRows.length !== 1 ? 'S' : ''}`;
            }
            
            // Redirect row pointer context index post-deletion
            if (remainingRows.length > 0) {
                selectRow(remainingRows[0]);
            } else {
                selectedPatientId = null;
            }
        }, 400);
    }
}

// Global window handling event listeners
document.addEventListener('keydown', function(e) {
    const rows = Array.from(document.querySelectorAll('.table-row')).filter(row => row.style.display !== 'none');
    const currentIndex = rows.findIndex(row => row.classList.contains('selected'));
    
    switch(e.key) {
        case 'ArrowDown':
            e.preventDefault();
            if (currentIndex < rows.length - 1) {
                selectRow(rows[currentIndex + 1]);
                rows[currentIndex + 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            break;
            
        case 'ArrowUp':
            e.preventDefault();
            if (currentIndex > 0) {
                selectRow(rows[currentIndex - 1]);
                rows[currentIndex - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            break;
            
        case 'Enter':
            if (document.activeElement.id === 'searchInput') {
                performSearch();
            } else if (currentIndex >= 0) {
                window.location.href = 'vitals.html';
            }
            break;
            
        case 'Delete':
            if (currentIndex >= 0) {
                deleteSelected();
            }
            break;
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.focus();
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') performSearch();
        });
    }
});