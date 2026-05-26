/**
 * WETS - Patient Search Page
 * Interactive search and selection functionality
 */

let selectedPatientId = '222'; // Default selected patient

// Select a table row
function selectRow(row) {
    // Remove selected class from all rows
    const allRows = document.querySelectorAll('.table-row');
    allRows.forEach(r => r.classList.remove('selected'));
    
    // Add selected class to clicked row
    row.classList.add('selected');
    
    // Update selected patient ID
    selectedPatientId = row.getAttribute('data-patient-id');
    
    // Visual feedback
    row.style.transition = 'all 0.3s ease';
}

// Perform search functionality
function performSearch() {
    const searchField = document.getElementById('searchField').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm.trim()) {
        alert('Please enter a search term');
        return;
    }
    
    const rows = document.querySelectorAll('.table-row');
    let foundCount = 0;
    
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
        } else {
            row.style.display = 'none';
        }
    });
    
    // Update records badge
    const recordsBadge = document.querySelector('.records-badge');
    recordsBadge.textContent = `${foundCount} RECORD${foundCount !== 1 ? 'S' : ''}`;
    
    // Animation feedback
    const searchBtn = document.querySelector('.btn-search');
    searchBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        searchBtn.style.transform = 'scale(1)';
    }, 150);
}

// Delete selected patient
function deleteSelected() {
    if (!selectedPatientId) {
        alert('Please select a patient to delete');
        return;
    }
    
    const confirmDelete = confirm(`Are you sure you want to delete patient ID ${selectedPatientId}?`);
    
    if (confirmDelete) {
        const selectedRow = document.querySelector(`.table-row[data-patient-id="${selectedPatientId}"]`);
        
        if (selectedRow) {
            // Fade out animation
            selectedRow.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            selectedRow.style.opacity = '0';
            selectedRow.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                selectedRow.remove();
                
                // Update records count
                const remainingRows = document.querySelectorAll('.table-row').length;
                const recordsBadge = document.querySelector('.records-badge');
                recordsBadge.textContent = `${remainingRows} RECORD${remainingRows !== 1 ? 'S' : ''}`;
                
                // Select first remaining row if exists
                const firstRow = document.querySelector('.table-row');
                if (firstRow) {
                    selectRow(firstRow);
                } else {
                    selectedPatientId = null;
                }
            }, 500);
        }
    }
}

// Enhanced keyboard navigation
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
                navigateTo('vitals.html');
            }
            break;
            
        case 'Delete':
            if (currentIndex >= 0) {
                deleteSelected();
            }
            break;
    }
});

// Allow Enter key in search input
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        performSearch();
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to table rows
    const rows = document.querySelectorAll('.table-row');
    rows.forEach(row => {
        row.addEventListener('mouseenter', function() {
            if (!this.classList.contains('selected')) {
                this.style.backgroundColor = '#f8fafc';
            }
        });
        
        row.addEventListener('mouseleave', function() {
            if (!this.classList.contains('selected')) {
                this.style.backgroundColor = '';
            }
        });
    });
    
    // Focus search input on load
    document.getElementById('searchInput').focus();
});