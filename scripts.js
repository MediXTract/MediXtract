// Application State Management
class MediXtractApp {
    constructor() {
        this.currentStage = 1;
        this.completedStages = [];
        this.medicalDocuments = [];
        this.jsonFiles = [];
        this.processingProgress = 0;
        this.processingStages = [
            { id: 'parsing', name: 'Document Parsing', duration: 15 },
            { id: 'critical', name: 'Critical Fields Analysis', duration: 20 },
            { id: 'specialized', name: 'Specialized Analysis', duration: 25 },
            { id: 'integration', name: 'Data Integration', duration: 10 },
            { id: 'validation', name: 'Quality Validation', duration: 8 }
        ];
        this.currentProcessingStage = 0;
        this.processingTimer = null;
        this.jsonData = null;
        this.categorizedFields = {
            highConfidence: {},
            doubleCheck: {},
            manualInput: {}
        };
        this.fieldAcceptanceState = {}; // Track acceptance state of fields
        this.patientDatabase = []; // Store patient data
        this.currentPatientId = null;
        this.userInfo = {
            name: 'Dr. Smith',
            role: 'Attending Physician',
            email: ''
        };
        this.processingActive = false; // Track if AI processing is active
        this.allPatients = []; // Store all patient records for filtering
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showStage(1);
    }

    setupEventListeners() {
        // Authentication form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // User Portal actions
        const newPatientCard = document.getElementById('newPatientCard');
        const viewPatientsCard = document.getElementById('viewPatientsCard');
        
        if (newPatientCard) {
            newPatientCard.addEventListener('click', () => this.goToNewPatient());
        }
        if (viewPatientsCard) {
            viewPatientsCard.addEventListener('click', () => this.goToPatientDatabase());
        }

        // Patient Database navigation
        const backToPortalBtn = document.getElementById('backToPortalBtn');
        const backPortalBtn = document.getElementById('backPortalBtn');
        const backToPortalFromDoc = document.getElementById('backToPortalFromDoc');
        
        if (backToPortalBtn) {
            backToPortalBtn.addEventListener('click', () => this.goToUserPortal());
        }
        if (backPortalBtn) {
            backPortalBtn.addEventListener('click', () => this.goToUserPortal());
        }
        if (backToPortalFromDoc) {
            backToPortalFromDoc.addEventListener('click', () => this.goToUserPortal());
        }

        // Patient Database filters - automatic updates
        const patientIdFilter = document.getElementById('patientIdFilter');
        const hospitalFilter = document.getElementById('hospitalFilter');
        const statusFilter = document.getElementById('statusFilter');
        const clearFiltersBtn = document.getElementById('clearFiltersBtn');
        const sortBySelect = document.getElementById('sortBy');

        if (patientIdFilter) {
            patientIdFilter.addEventListener('input', () => this.applyDatabaseFilters());
        }
        if (hospitalFilter) {
            hospitalFilter.addEventListener('change', () => this.applyDatabaseFilters());
        }
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.applyDatabaseFilters());
        }
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.clearDatabaseFilters());
        }
        if (sortBySelect) {
            sortBySelect.addEventListener('change', () => this.applyDatabaseFilters());
        }

        // Folder selection
        const selectFolderBtn = document.getElementById('selectFolderBtn');
        const folderInput = document.getElementById('folderInput');
        
        if (selectFolderBtn && folderInput) {
            selectFolderBtn.addEventListener('click', () => folderInput.click());
            folderInput.addEventListener('change', (e) => this.handleFolderSelection(e));
        }

        // Start processing button
        const startProcessingBtn = document.getElementById('startProcessingBtn');
        if (startProcessingBtn) {
            startProcessingBtn.addEventListener('click', () => this.startProcessing());
        }

        // Results navigation
        const navTabs = document.querySelectorAll('.nav-tab');
        navTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchResultsSection(tab.dataset.section));
        });

        // Processing popup toggle
        const popupToggle = document.getElementById('popupToggle');
        const popupHeader = document.querySelector('.popup-header');
        if (popupToggle && popupHeader) {
            popupHeader.addEventListener('click', () => this.toggleProcessingPopup());
        }

        // Accept All buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-accept-all')) {
                this.handleAcceptAll(e.target.dataset.section);
            }
        });

        // Field editing and actions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('field-value') && e.target.classList.contains('editable')) {
                this.enableFieldEditing(e.target);
            }
            if (e.target.classList.contains('btn-edit')) {
                const fieldCard = e.target.closest('.field-card');
                this.handleFieldEdit(fieldCard);
            }
            if (e.target.classList.contains('btn-accept')) {
                this.handleFieldAccept(e.target);
            }
            if (e.target.classList.contains('btn-review')) {
                this.showPDFReview();
            }
            if (e.target.classList.contains('btn-delivery') || e.target.classList.contains('btn-delivery-fixed')) {
                this.handleDelivery();
            }
            if (e.target.classList.contains('pdf-close') || e.target.closest('.pdf-close')) {
                this.closePDFReview();
            }
            if (e.target.classList.contains('delivery-notification-close') || e.target.closest('.delivery-notification-close')) {
                this.hideDeliveryNotification();
            }
        });

        // PDF Review Panel - Close when clicking outside
        document.addEventListener('click', (e) => {
            const pdfPanel = document.getElementById('pdfReviewPanel');
            const overlay = document.getElementById('pdfOverlay');
            
            if (pdfPanel && pdfPanel.classList.contains('active')) {
                // Check if click is on the overlay or outside the panel
                if (e.target === overlay || (!pdfPanel.contains(e.target) && !e.target.classList.contains('btn-review'))) {
                    this.closePDFReview();
                }
            }
        });

        // Keyboard event handlers
        document.addEventListener('keydown', (e) => {
            // ESC key to close PDF review panel
            if (e.key === 'Escape') {
                const pdfPanel = document.getElementById('pdfReviewPanel');
                if (pdfPanel && pdfPanel.classList.contains('active')) {
                    this.closePDFReview();
                    e.preventDefault();
                }
            }
        });

        // Secondary actions in User Portal
        document.addEventListener('click', (e) => {
            const secondaryAction = e.target.closest('.secondary-action-item');
            if (secondaryAction) {
                this.handleSecondaryAction(secondaryAction);
            }
        });

        // No manual step navigation - pure sequential flow only
    }

    // Stage Management
    goToStage(stageNumber) {
        this.currentStage = stageNumber;
        this.showStage(stageNumber);
    }

    completeStage(stageNumber) {
        if (!this.completedStages.includes(stageNumber)) {
            this.completedStages.push(stageNumber);
        }
    }

    showStage(stageNumber) {
        // Hide all stages
        document.querySelectorAll('.stage-content').forEach(stage => {
            stage.classList.remove('active');
        });

        // Show current stage
        const currentStage = document.getElementById(`stage-${stageNumber}`);
        if (currentStage) {
            currentStage.classList.add('active');
        }

        this.currentStage = stageNumber;
    }

    // Authentication
    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;

        if (!email || !password || !role) {
            this.showNotification('Please fill in all fields', 'warning');
            return;
        }

        // Store user info
        this.userInfo.email = email;
        this.userInfo.role = this.formatRole(role);
        this.userInfo.name = this.extractNameFromEmail(email);

        // Simulate login process
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
        submitBtn.disabled = true;

        try {
            await this.delay(500); // Faster login simulation
            
            // Complete authentication stage
            this.completeStage(1);
            this.showNotification('Login successful! Welcome to MediXtract', 'success');
            
            // Move to User Portal (stage 2) immediately
            setTimeout(() => {
                this.currentStage = 2;
                this.showStage(2);
                this.updateUserPortalInfo();
            }, 800);

        } catch (error) {
            this.showNotification('Login failed. Please try again.', 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    // User Portal Methods
    updateUserPortalInfo() {
        const userNameElement = document.getElementById('userName');
        const userRoleElement = document.getElementById('userRole');
        
        if (userNameElement) {
            userNameElement.textContent = this.userInfo.name;
        }
        if (userRoleElement) {
            userRoleElement.textContent = this.userInfo.role;
        }
        
        this.updateUserPortalStats();
    }

    updateUserPortalStats() {
        // Update statistics in the user portal
        const ongoingElement = document.getElementById('ongoingPatients');
        const completedElement = document.getElementById('completedPatients');
        const fieldsElement = document.getElementById('totalFieldsProcessed');
        
        if (ongoingElement) {
            ongoingElement.textContent = '3'; // Could be dynamic in real app
        }
        if (completedElement) {
            completedElement.textContent = '21'; // Could be dynamic in real app
        }
        if (fieldsElement) {
            fieldsElement.textContent = '156'; // Could be dynamic in real app
        }
    }

    loadPatientDatabase() {
        // Generate sample patient data
        this.allPatients = [
            { id: 'NEC-2024-023', hospital: 'General Hospital', date: '2024-01-14', status: 'completed', fields: 34, hospitalKey: 'general' },
            { id: 'NEC-2024-022', hospital: 'Children\'s Hospital', date: '2024-01-13', status: 'review', fields: 28, hospitalKey: 'children' },
            { id: 'NEC-2024-021', hospital: 'Medical Center', date: '2024-01-12', status: 'delivered', fields: 31, hospitalKey: 'medical' },
            { id: 'NEC-2024-020', hospital: 'University Hospital', date: '2024-01-11', status: 'processing', fields: 15, hospitalKey: 'university' },
            { id: 'NEC-2024-019', hospital: 'General Hospital', date: '2024-01-10', status: 'completed', fields: 33, hospitalKey: 'general' },
            { id: 'NEC-2024-018', hospital: 'Children\'s Hospital', date: '2024-01-09', status: 'delivered', fields: 29, hospitalKey: 'children' },
            { id: 'NEC-2024-017', hospital: 'Medical Center', date: '2024-01-08', status: 'review', fields: 27, hospitalKey: 'medical' },
            { id: 'NEC-2024-016', hospital: 'University Hospital', date: '2024-01-07', status: 'completed', fields: 32, hospitalKey: 'university' },
            { id: 'NEC-2024-015', hospital: 'General Hospital', date: '2024-01-06', status: 'processing', fields: 18, hospitalKey: 'general' },
            { id: 'NEC-2024-014', hospital: 'Children\'s Hospital', date: '2024-01-05', status: 'delivered', fields: 30, hospitalKey: 'children' }
        ];
        
        // Apply default sort by date (newest first)
        const sortedPatients = this.sortPatients(this.allPatients, 'date');
        this.renderPatientDatabase(sortedPatients);
        this.updateResultsCount(this.allPatients.length);
    }

    applyDatabaseFilters() {
        const patientIdFilter = document.getElementById('patientIdFilter').value.toLowerCase();
        const hospitalFilter = document.getElementById('hospitalFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const sortBy = document.getElementById('sortBy').value;

        let filteredPatients = this.allPatients.filter(patient => {
            const matchesId = !patientIdFilter || patient.id.toLowerCase().includes(patientIdFilter);
            const matchesHospital = !hospitalFilter || patient.hospitalKey === hospitalFilter;
            const matchesStatus = !statusFilter || patient.status === statusFilter;
            
            return matchesId && matchesHospital && matchesStatus;
        });

        // Apply sorting
        filteredPatients = this.sortPatients(filteredPatients, sortBy);

        this.renderPatientDatabase(filteredPatients);
        this.updateResultsCount(filteredPatients.length);
    }

    sortPatients(patients, sortBy) {
        const sortedPatients = [...patients];
        
        switch (sortBy) {
            case 'date':
                return sortedPatients.sort((a, b) => new Date(b.date) - new Date(a.date));
            case 'patient-id':
                return sortedPatients.sort((a, b) => a.id.localeCompare(b.id));
            case 'status':
                return sortedPatients.sort((a, b) => a.status.localeCompare(b.status));
            case 'hospital':
                return sortedPatients.sort((a, b) => a.hospital.localeCompare(b.hospital));
            default:
                return sortedPatients;
        }
    }

    clearDatabaseFilters() {
        document.getElementById('patientIdFilter').value = '';
        document.getElementById('hospitalFilter').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('sortBy').value = 'date';
        
        const sortedPatients = this.sortPatients(this.allPatients, 'date');
        this.renderPatientDatabase(sortedPatients);
        this.updateResultsCount(this.allPatients.length);
        this.showNotification('Filters cleared', 'info');
    }

    updateResultsCount(count) {
        const resultsCountElement = document.getElementById('resultsCount');
        if (resultsCountElement) {
            resultsCountElement.textContent = `(${count} found)`;
        }
    }

    renderPatientDatabase(patients) {
        const tbody = document.getElementById('patientRecordsBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        patients.forEach(patient => {
            const row = document.createElement('div');
            row.className = 'table-row';
            row.innerHTML = `
                <div class="table-cell patient-id-cell" data-label="Patient ID">${patient.id}</div>
                <div class="table-cell" data-label="Hospital">${patient.hospital}</div>
                <div class="table-cell" data-label="Date Added">${patient.date}</div>
                <div class="table-cell" data-label="Status">
                    <span class="status-badge status-${patient.status}">${this.formatStatus(patient.status)}</span>
                </div>
                <div class="table-cell" data-label="Fields">${patient.fields}</div>
                <div class="table-cell" data-label="Actions">
                    <div class="action-buttons">
                        <button class="btn-view" onclick="window.medixtractApp.viewPatient('${patient.id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        ${patient.status !== 'delivered' ? `<button class="btn-edit-record" onclick="window.medixtractApp.editPatient('${patient.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>` : ''}
                    </div>
                </div>
            `;
            tbody.appendChild(row);
        });
    }

    formatStatus(status) {
        const statusMap = {
            'processing': 'Processing',
            'review': 'Under Review', 
            'completed': 'Completed',
            'delivered': 'Delivered'
        };
        return statusMap[status] || status;
    }

    viewPatient(patientId) {
        this.showNotification(`Viewing patient ${patientId}`, 'info');
        // In a real app, this would navigate to the patient details
    }

    editPatient(patientId) {
        this.showNotification(`Editing patient ${patientId}`, 'info');
        // In a real app, this would navigate to the edit interface
    }

    formatRole(role) {
        const roleMap = {
            'physician': 'Attending Physician',
            'resident': 'Resident',
            'analyst': 'Data Analyst',
            'coordinator': 'Research Coordinator'
        };
        return roleMap[role] || role;
    }

    extractNameFromEmail(email) {
        const namePart = email.split('@')[0];
        const words = namePart.split(/[._-]/).map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        );
        return 'Dr. ' + words.join(' ');
    }

    goToNewPatient() {
        this.completeStage(2);
        this.currentStage = 4; // Document Management is now stage 4
        this.showStage(4);
        // Reset everything for new patient
        this.resetForNewPatient();
        this.showNotification('Ready to process new patient documents', 'info');
    }

    goToPatientDatabase() {
        this.completeStage(2);
        this.currentStage = 3; // Patient Database is stage 3
        this.showStage(3);
        this.loadPatientDatabase();
        this.showNotification('Loading patient database...', 'info');
    }

    goToUserPortal() {
        this.currentStage = 2;
        this.showStage(2);
        this.updateUserPortalStats();
    }

    handleSecondaryAction(actionItem) {
        const text = actionItem.querySelector('span').textContent;
        
        switch (text) {
            case 'System Settings':
                this.showNotification('System settings coming soon', 'info');
                break;
            case 'Export Reports':
                this.showNotification('Export functionality coming soon', 'info');
                break;
            case 'Help & Support':
                this.showNotification('Help documentation coming soon', 'info');
                break;
            case 'Sign Out':
                this.handleSignOut();
                break;
            default:
                this.showNotification(`${text} feature coming soon`, 'info');
        }
    }

    handleSignOut() {
        this.currentStage = 1;
        this.showStage(1);
        this.completedStages = [];
        this.userInfo = { name: 'Dr. Smith', role: 'Attending Physician', email: '' };
        
        // Reset form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.reset();
        }
        
        this.showNotification('Successfully signed out', 'success');
    }

    // Folder Selection and Analysis
    async handleFolderSelection(event) {
        const files = Array.from(event.target.files);
        console.log('Selected files:', files);
        
        if (files.length === 0) {
            this.showNotification('No files selected. Please choose a folder.', 'warning');
            return;
        }

        // Separate medical documents from JSON files
        this.medicalDocuments = [];
        this.jsonFiles = [];
        
        files.forEach(file => {
            if (file.name.toLowerCase().endsWith('.json')) {
                this.jsonFiles.push(file);
            } else if (this.isMedicalDocument(file)) {
                this.medicalDocuments.push(file);
            }
        });

        console.log('Medical documents:', this.medicalDocuments);
        console.log('JSON files:', this.jsonFiles);

        // Validate folder contents
        if (this.medicalDocuments.length === 0) {
            this.showNotification('No medical documents found in selected folder.', 'warning');
            return;
        }

        if (this.jsonFiles.length === 0) {
            this.showNotification('No JSON schema file found in selected folder.', 'warning');
            return;
        }

        // Load and validate JSON file
        try {
            await this.loadJsonFromFile(this.jsonFiles[0]);
            this.showFolderAnalysis(files[0].webkitRelativePath.split('/')[0]);
        } catch (error) {
            console.error('Error loading JSON file:', error);
            this.showNotification('Error reading JSON schema file.', 'error');
        }
    }

    isMedicalDocument(file) {
        const medicalExtensions = ['.pdf', '.doc', '.docx', '.txt', '.rtf'];
        const fileName = file.name.toLowerCase();
        return medicalExtensions.some(ext => fileName.endsWith(ext));
    }

    async loadJsonFromFile(jsonFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    this.jsonData = JSON.parse(e.target.result);
                    console.log('Successfully loaded JSON from file:', this.jsonData);
                    this.categorizeFields();
                    resolve();
                } catch (error) {
                    reject(new Error('Invalid JSON file format'));
                }
            };
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsText(jsonFile);
        });
    }

    showFolderAnalysis(folderName) {
        const folderSelection = document.getElementById('folderSelection');
        const folderAnalysis = document.getElementById('folderAnalysis');
        const folderPath = document.getElementById('folderPath');

        // Hide folder selection and show analysis
        folderSelection.style.display = 'none';
        folderAnalysis.style.display = 'block';

        // Update folder path
        folderPath.textContent = `Selected folder: ${folderName}`;

        // Render medical documents
        this.renderMedicalDocuments();
        
        // Show JSON schema info
        this.renderSchemaInfo();
        
        // Update summary statistics
        this.updateFolderSummary();
        
        this.showNotification(`Successfully analyzed folder: ${folderName}`, 'success');
    }

    renderMedicalDocuments() {
        const container = document.getElementById('medicalFiles');
        container.innerHTML = '';

        this.medicalDocuments.forEach(file => {
            const fileElement = document.createElement('div');
            fileElement.className = 'medical-file-item';
            
            const fileExtension = this.getFileExtension(file.name);
            const iconClass = this.getFileIconClass(fileExtension);
            const typeClass = this.getFileTypeClass(fileExtension);
            
            fileElement.innerHTML = `
                <div class="file-type-icon ${typeClass}">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div class="medical-file-info">
                    <h5>${file.name}</h5>
                    <p>${this.formatFileSize(file.size)} • ${this.getFileTypeDisplay(fileExtension)}</p>
                </div>
            `;
            
            container.appendChild(fileElement);
        });
    }

    renderSchemaInfo() {
        const container = document.getElementById('schemaFile');
        const jsonFile = this.jsonFiles[0];
        // Handle both direct field structure and properties structure
        const fieldsData = this.jsonData.properties || this.jsonData;
        const fieldCount = Object.keys(fieldsData).length;
        
        container.innerHTML = `
            <div class="schema-file-icon">
                <i class="fas fa-file-code"></i>
            </div>
            <h5>${jsonFile.name}</h5>
            <p>${this.formatFileSize(jsonFile.size)}</p>
            <div class="schema-fields-info">
                Contains ${fieldCount} data field definitions
            </div>
        `;
    }

    updateFolderSummary() {
        const totalDocs = this.medicalDocuments.length;
        // Handle both direct field structure and properties structure
        const fieldsData = this.jsonData.properties || this.jsonData;
        const totalFields = Object.keys(fieldsData).length;
        const estimatedTime = Math.ceil(totalDocs * 2.5); // Estimate 2.5 minutes per document

        document.getElementById('totalDocsCount').textContent = totalDocs;
        document.getElementById('totalFieldsCount').textContent = totalFields;
        document.getElementById('estimatedTime').textContent = estimatedTime;

        // Enable processing button
        const processBtn = document.getElementById('startProcessingBtn');
        if (processBtn) {
            processBtn.disabled = false;
        }
    }

    getFileExtension(fileName) {
        return fileName.split('.').pop().toLowerCase();
    }

    getFileIconClass(extension) {
        const icons = {
            'pdf': 'fa-file-pdf',
            'doc': 'fa-file-word',
            'docx': 'fa-file-word',
            'txt': 'fa-file-text',
            'rtf': 'fa-file-text',
            'json': 'fa-file-code'
        };
        return icons[extension] || 'fa-file';
    }

    getFileTypeClass(extension) {
        const typeMap = {
            'pdf': 'file-type-pdf',
            'doc': 'file-type-doc',
            'docx': 'file-type-doc',
            'txt': 'file-type-txt',
            'rtf': 'file-type-txt',
            'json': 'file-type-json'
        };
        return typeMap[extension] || 'file-type-txt';
    }

    getFileTypeDisplay(extension) {
        const displays = {
            'pdf': 'PDF Document',
            'doc': 'Word Document',
            'docx': 'Word Document', 
            'txt': 'Text Document',
            'rtf': 'Rich Text Document',
            'json': 'JSON Schema'
        };
        return displays[extension] || 'Document';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // AI Processing
    async startProcessing() {
        this.completeStage(4); // Document Management is now stage 4
        this.currentStage = 5; // Results Dashboard is now stage 5
        this.showStage(5);
        this.processingActive = true;
        
        // Reset delivery notification state for new patient
        this.resetDeliveryNotification();
        
        // Reset field acceptance states for new patient
        this.fieldAcceptanceState = {};
        
        // Update processing header to show discovered documents
        const processingPatient = document.getElementById('processingPatient');
        if (processingPatient) {
            processingPatient.textContent = `Processing ${this.medicalDocuments.length} discovered medical documents`;
        }
        
        // Load JSON data and show manual input fields immediately
        await this.loadJsonData();
        
        // Reset processing state
        this.processingProgress = 0;
        this.currentProcessingStage = 0;
        
        // Start processing simulation
        await this.delay(500);
        this.runProcessingSimulation();
    }

    resetForNewPatient() {
        // Clear all field containers for fresh start
        const containers = ['manual-input-fields', 'high-confidence-fields', 'double-check-fields'];
        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '';
            }
        });
        
        // Reset processing states
        this.processingActive = false;
        this.medicalDocuments = [];
        this.jsonFiles = [];
        this.jsonData = null;
        this.categorizedFields = {
            highConfidence: {},
            doubleCheck: {},
            manualInput: {}
        };
        
        // Reset delivery notification completely
        this.resetDeliveryNotification();
        
        // Reset folder selection interface
        const folderSelection = document.getElementById('folderSelection');
        const folderAnalysis = document.getElementById('folderAnalysis');
        if (folderSelection && folderAnalysis) {
            folderSelection.style.display = 'block';
            folderAnalysis.style.display = 'none';
        }
        
        // Reset folder input
        const folderInput = document.getElementById('folderInput');
        if (folderInput) {
            folderInput.value = '';
        }
    }

    resetDeliveryNotification() {
        // Hide delivery notification if it's visible
        this.hideDeliveryNotification();
        
        // Reset delivery button to original state
        const deliveryBtn = document.querySelector('.btn-delivery-fixed');
        if (deliveryBtn) {
            deliveryBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Deliver Patient Data';
            deliveryBtn.disabled = false;
            deliveryBtn.style.opacity = '1';
        }
        
        // Don't reset fieldAcceptanceState here - that should be handled separately
    }

    async runProcessingSimulation() {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const progressTime = document.getElementById('progressTime');
        const completionMessage = document.getElementById('completionMessage');
        const processingHeader = document.getElementById('processingHeader');

        // Show processing popup
        const processingPopup = document.getElementById('processingPopup');
        if (processingPopup) {
            processingPopup.style.display = 'block';
        }

        // Hide completion message initially
        if (completionMessage) completionMessage.classList.remove('show');

        // Calculate total duration based on selected documents
        const totalDocs = this.medicalDocuments.length;
        const baseDuration = this.processingStages.reduce((sum, stage) => sum + stage.duration, 0);
        let elapsed = 0;

        for (let i = 0; i < this.processingStages.length; i++) {
            const stage = this.processingStages[i];
            this.currentProcessingStage = i;
            
            // Update current stage
            this.updateProcessingStageUI(i, 'active');
            
            // Create realistic processing messages based on selected documents
            let stageMessage = this.getRealisticProcessingMessage(stage, i);
            if (progressText) progressText.textContent = stageMessage;
            
            // Update popup with current progress
            const currentProgress = ((elapsed + stage.duration/2) / baseDuration) * 100;
            const timeRemaining = baseDuration - elapsed - stage.duration/2;
            this.updateProcessingPopup(stageMessage, currentProgress, timeRemaining);
            
            // Animate progress for this stage
            const stageStart = elapsed;
            const stageEnd = elapsed + stage.duration;
            
            if (progressFill && progressTime) {
                await this.animateProgress(
                    (stageStart / baseDuration) * 100,
                    (stageEnd / baseDuration) * 100,
                    stage.duration * 100, // Convert to milliseconds
                    progressFill,
                    progressTime,
                    baseDuration - stageEnd
                );
            } else {
                // Just wait for the stage duration if elements don't exist
                await this.delay(stage.duration * 100);
            }
            
            // Mark stage as completed
            this.updateProcessingStageUI(i, 'completed');
            elapsed += stage.duration;
        }

        // Complete processing
        this.processingActive = false;
        
        // Complete all stages in popup
        this.currentProcessingStage = this.processingStages.length;
        this.updateProcessingPopup('Processing Complete!', 100, 0);
        
        // Show completion with actual file names
        const processedFileNames = this.medicalDocuments.slice(0, 3).map(doc => doc.name).join(', ');
        const moreFiles = this.medicalDocuments.length > 3 ? ` and ${this.medicalDocuments.length - 3} more files` : '';
        
        if (progressText) {
            progressText.textContent = `Successfully processed: ${processedFileNames}${moreFiles}`;
        }
        if (progressTime) {
            progressTime.textContent = `Extracted data from ${totalDocs} medical documents using ${this.jsonFiles[0].name}`;
        }
        
        await this.delay(1000);
        if (completionMessage) completionMessage.classList.add('show');
        
        // Mark processing header as completed
        if (processingHeader) processingHeader.classList.add('completed');
        
        // Hide processing popup and complete stage
        setTimeout(() => {
            this.hideProcessingPopup();
            this.completeStage(5);
        }, 2000);
    }
    getRealisticProcessingMessage(stage, index) {
        const docCount = this.medicalDocuments.length;
        const fileTypes = [...new Set(this.medicalDocuments.map(doc => this.getFileExtension(doc.name)))];
        const fileTypeText = fileTypes.includes('pdf') ? 'PDF and Word files' : 'document files';
        
        const messages = {
            0: [
                `Parsing ${docCount} medical documents...`, 
                `Extracting text from ${fileTypeText}...`, 
                `Analyzing document structure and metadata...`
            ],
            1: [
                `Analyzing critical fields across ${docCount} documents...`, 
                `Extracting antibiotics and medication data...`, 
                `Processing feeding and nutrition information...`
            ],
            2: [
                `Processing specialized clinical data...`, 
                `Analyzing surgical reports and procedures...`, 
                `Extracting respiratory support information...`
            ],
            3: [
                `Integrating data from ${docCount} sources...`, 
                `Resolving conflicts between documents...`, 
                `Cross-validating extracted information...`
            ],
            4: [
                'Performing quality validation...', 
                'Calculating confidence scores...', 
                'Finalizing extracted dataset...'
            ]
        };
        
        const stageMessages = messages[index] || ['Processing...'];
        const randomMessage = stageMessages[Math.floor(Math.random() * stageMessages.length)];
        return randomMessage;
    }

    async animateProgress(startPercent, endPercent, duration, progressFill, progressTime, remainingTime) {
        const steps = 50;
        const stepDuration = duration / steps;
        const progressStep = (endPercent - startPercent) / steps;

        for (let i = 0; i <= steps; i++) {
            const currentProgress = startPercent + (progressStep * i);
            progressFill.style.width = `${currentProgress}%`;
            
            const timeRemaining = Math.max(0, remainingTime - ((i / steps) * (duration / 100)));
            progressTime.textContent = `Estimated time remaining: ${Math.ceil(timeRemaining)} seconds`;
            
            await this.delay(stepDuration);
        }
    }

    updateProcessingStageUI(stageIndex, status) {
        const stages = document.querySelectorAll('.processing-stage');
        
        stages.forEach((stage, index) => {
            stage.classList.remove('active', 'completed');
            
            if (index < stageIndex) {
                stage.classList.add('completed');
            } else if (index === stageIndex) {
                if (status === 'active') {
                    stage.classList.add('active');
                } else if (status === 'completed') {
                    stage.classList.add('completed');
                }
            }
        });
    }

    // JSON Data Management
    async loadJsonData() {
        try {
            // Use sample data if no JSON was loaded from files
            if (!this.jsonData) {
                this.loadSampleData();
            }
            
            this.categorizeFields();
            this.renderFields();
            this.updateFieldCounts();
            
        } catch (error) {
            console.error('Error loading JSON data:', error);
            this.showNotification('No JSON data file found. Using sample data.', 'warning');
            this.loadSampleData();
        }
    }

    categorizeFields() {
        // Reset categories
        this.categorizedFields = {
            highConfidence: {},
            doubleCheck: {},
            manualInput: {}
        };
        
        console.log('Categorizing fields from JSON data:', this.jsonData);
        
        // Extract fields from the properties object if it exists
        const fieldsData = this.jsonData.properties || this.jsonData;
        
        Object.keys(fieldsData).forEach(fieldName => {
            const field = fieldsData[fieldName];
            const groupId = field.group_id;
            
            console.log(`Field: ${fieldName}, Group: ${groupId}`);
            
            if (groupId === 'group_1' || groupId === 'group_3') {
                this.categorizedFields.highConfidence[fieldName] = field;
            } else if (groupId === 'group_2' || groupId === 'group_5') {
                this.categorizedFields.doubleCheck[fieldName] = field;
            } else if (groupId === 'group_4') {
                this.categorizedFields.manualInput[fieldName] = field;
            } else {
                // Default to high confidence if group_id is unclear
                console.warn(`Unknown group_id: ${groupId} for field: ${fieldName}, defaulting to high confidence`);
                this.categorizedFields.highConfidence[fieldName] = field;
            }
        });
        
        console.log('Categorized fields:', this.categorizedFields);
    }

    renderFields() {
        console.log('Starting to render fields...');
        this.renderManualInputFields();
        this.renderHighConfidenceFields();
        this.renderDoubleCheckFields();
    }

    renderManualInputFields() {
        const container = document.getElementById('manual-input-fields');
        if (!container) {
            console.error('Manual input fields container not found');
            return;
        }
        
        console.log('Rendering manual input fields:', this.categorizedFields.manualInput);
        container.innerHTML = '';
        
        const manualFields = Object.keys(this.categorizedFields.manualInput);
        if (manualFields.length === 0) {
            container.innerHTML = '<p style="color: var(--gray-500); text-align: center; padding: 40px;">No manual input fields found in the current dataset.</p>';
            return;
        }
        
        manualFields.forEach(fieldName => {
            const field = this.categorizedFields.manualInput[fieldName];
            const fieldCard = this.createFieldCard(fieldName, field, 'manual-input');
            container.appendChild(fieldCard);
            
            // Add input listeners for manual input fields
            setTimeout(() => {
                const manualInput = fieldCard.querySelector('.field-input, .field-select');
                if (manualInput) {
                    manualInput.addEventListener('input', () => {
                        if (this.fieldAcceptanceState[fieldName]) {
                            this.handleFieldEdit(fieldCard);
                        }
                    });
                }
            }, 100);
        });
        
        console.log(`Rendered ${manualFields.length} manual input fields`);
    }

    renderHighConfidenceFields() {
        const container = document.getElementById('high-confidence-fields');
        if (!container) {
            console.error('High confidence fields container not found');
            return;
        }
        
        console.log('Rendering high confidence fields:', this.categorizedFields.highConfidence);
        container.innerHTML = '';
        
        const highConfidenceFields = Object.keys(this.categorizedFields.highConfidence);
        if (highConfidenceFields.length === 0) {
            container.innerHTML = '<p style="color: var(--gray-500); text-align: center; padding: 40px;">No high confidence fields found. They will appear as AI processing completes.</p>';
            return;
        }
        
        highConfidenceFields.forEach(fieldName => {
            const field = this.categorizedFields.highConfidence[fieldName];
            const fieldCard = this.createFieldCard(fieldName, field, 'high-confidence');
            container.appendChild(fieldCard);
        });
        
        console.log(`Rendered ${highConfidenceFields.length} high confidence fields`);
    }

    renderDoubleCheckFields() {
        const container = document.getElementById('double-check-fields');
        if (!container) {
            console.error('Double check fields container not found');
            return;
        }
        
        console.log('Rendering double check fields:', this.categorizedFields.doubleCheck);
        container.innerHTML = '';
        
        const doubleCheckFields = Object.keys(this.categorizedFields.doubleCheck);
        if (doubleCheckFields.length === 0) {
            container.innerHTML = '<p style="color: var(--gray-500); text-align: center; padding: 40px;">No double check fields found. They will appear as AI processing completes.</p>';
            return;
        }
        
        doubleCheckFields.forEach(fieldName => {
            const field = this.categorizedFields.doubleCheck[fieldName];
            const fieldCard = this.createFieldCard(fieldName, field, 'double-check');
            container.appendChild(fieldCard);
        });
        
        console.log(`Rendered ${doubleCheckFields.length} double check fields`);
    }

    createFieldCard(fieldName, field, category) {
        console.log(`Creating field card for: ${fieldName}, category: ${category}`, field);
        
        const card = document.createElement('div');
        card.className = 'field-card pending'; // Start as pending
        card.dataset.fieldId = fieldName;
        card.dataset.category = category;
        
        // Initialize acceptance state
        this.fieldAcceptanceState[fieldName] = false;
        
        // Add confidence indicators for different categories (no status badges)
        let confidenceBadge = '';
        if (category === 'high-confidence') {
            confidenceBadge = '<span class="confidence-badge high">99.1%</span>';
        } else if (category === 'double-check') {
            confidenceBadge = '<span class="confidence-badge medium">87.3%</span>';
        }
        
        let fieldContent = '';
        let fieldActions = '';
        
        try {
            if (category === 'high-confidence') {
                fieldContent = `
                    <div class="field-value editable" data-field="${fieldName}" data-original-value="${this.generateSampleValue(field, fieldName)}">${this.generateSampleValue(field, fieldName)}</div>
                `;
                fieldActions = `
                    <div class="field-actions">
                        <button class="btn-edit" style="display: none;">✏️ Edit</button>
                        <button class="btn-accept">✓ Accept</button>
                        <button class="btn-review">Review</button>
                    </div>
                `;
            } else if (category === 'double-check') {
                fieldContent = `
                    <div class="field-value editable" data-field="${fieldName}" data-original-value="${this.generateSampleValue(field, fieldName)}">${this.generateSampleValue(field, fieldName)}</div>
                `;
                fieldActions = `
                    <div class="field-actions">
                        <button class="btn-edit" style="display: none;">✏️ Edit</button>
                        <button class="btn-accept">✓ Accept</button>
                        <button class="btn-review">Review</button>
                    </div>
                `;
            } else if (category === 'manual-input') {
                fieldContent = this.generateInputField(field);
                fieldActions = `
                    <div class="field-actions">
                        <button class="btn-edit" style="display: none;">✏️ Edit</button>
                        <button class="btn-accept">✓ Save</button>
                    </div>
                `;
            }
            
            // Add field constraints information if available
            let constraintsInfo = '';
            if (field.anyOf && field.anyOf[0]) {
                const constraints = field.anyOf[0];
                let constraintText = '';
                
                if (constraints.minimum !== undefined && constraints.maximum !== undefined) {
                    constraintText = `Range: ${constraints.minimum}-${constraints.maximum}`;
                } else if (constraints.enum) {
                    constraintText = `Options: ${constraints.enum.length} values`;
                }
                
                if (constraintText) {
                    constraintsInfo = `<div class="field-constraints">${constraintText}</div>`;
                }
            }
            
            card.innerHTML = `
                <div class="field-header">
                    <div class="field-name-container">
                        <span class="field-name">${this.formatFieldName(fieldName)}</span>
                        <div class="info-icon">
                            <i class="fas fa-info"></i>
                            <div class="tooltip">${field.description || 'No description available'}</div>
                        </div>
                    </div>
                    <div class="field-badges">
                        ${confidenceBadge}
                    </div>
                </div>
                ${fieldContent}
                ${constraintsInfo}
                ${fieldActions}
                ${field.comments ? `<div class="field-comments" style="font-size: 0.8rem; color: var(--gray-500); margin-top: 10px; font-style: italic; line-height: 1.4; display: none;">${field.comments}</div>` : ''}
            `;
            
        } catch (error) {
            console.error('Error creating field card:', error);
            card.innerHTML = `
                <div class="field-header">
                    <div class="field-name-container">
                        <span class="field-name">${this.formatFieldName(fieldName)}</span>
                    </div>
                </div>
                <div style="color: var(--danger); padding: 10px;">Error rendering field</div>
            `;
        }
        
        return card;
    }

    generateInputField(field) {
        const fieldType = this.getFieldType(field);
        
        if (fieldType === 'select') {
            const options = this.getFieldOptions(field);
            let optionsHtml = '<option value="">Select an option...</option>';
            
            // Handle enum options with descriptions from the field description
            if (field.description && field.description.includes('Options:')) {
                const optionsText = field.description.split('Options:')[1];
                const optionPairs = optionsText.split(',').map(opt => opt.trim());
                
                optionPairs.forEach(optionPair => {
                    const match = optionPair.match(/(\d+)=(.+?)(?:,|$)/);
                    if (match) {
                        const value = match[1];
                        const label = match[2].trim();
                        optionsHtml += `<option value="${value}">${value} - ${label}</option>`;
                    }
                });
            } else {
                // Fallback to raw enum values
                options.forEach(option => {
                    optionsHtml += `<option value="${option}">${option}</option>`;
                });
            }
            
            return `<select class="field-select">${optionsHtml}</select>`;
        } else if (fieldType === 'date') {
            return `<input type="date" class="field-input">`;
        } else if (fieldType === 'number') {
            const min = this.getFieldMin(field);
            const max = this.getFieldMax(field);
            let attributes = '';
            if (min !== null) attributes += ` min="${min}"`;
            if (max !== null) attributes += ` max="${max}"`;
            return `<input type="number" class="field-input" placeholder="Enter value"${attributes}>`;
        } else {
            return `<input type="text" class="field-input" placeholder="Enter value">`;
        }
    }

    getFieldType(field) {
        if (field.anyOf && field.anyOf[0]) {
            const firstType = field.anyOf[0];
            if (firstType.enum) return 'select';
            if (firstType.format === 'date') return 'date';
            if (firstType.type === 'number' || firstType.type === 'integer') return 'number';
        }
        return 'text';
    }

    getFieldOptions(field) {
        if (field.anyOf && field.anyOf[0]) {
            if (field.anyOf[0].enum) {
                return field.anyOf[0].enum;
            }
            if (field.anyOf[0].items && field.anyOf[0].items.enum) {
                return field.anyOf[0].items.enum;
            }
        }
        return [];
    }

    getFieldMin(field) {
        if (field.anyOf && field.anyOf[0] && field.anyOf[0].minimum !== undefined) {
            return field.anyOf[0].minimum;
        }
        return null;
    }

    getFieldMax(field) {
        if (field.anyOf && field.anyOf[0] && field.anyOf[0].maximum !== undefined) {
            return field.anyOf[0].maximum;
        }
        return null;
    }

    generateSampleValue(field, fieldName = '') {
        // Generate realistic sample values based on field type and description
        const description = field.description ? field.description.toLowerCase() : '';
        
        // If fieldName wasn't passed, try to find it in the data structure
        if (!fieldName) {
            const fieldsData = this.jsonData.properties || this.jsonData;
            fieldName = Object.keys(fieldsData).find(key => fieldsData[key] === field) || '';
        }
        
        // Use field name for specific mappings
        if (fieldName.includes('record_id')) return 'K001';
        if (fieldName.includes('p_ga_weeks')) return '32 weeks';
        if (fieldName.includes('p_ga_days')) return '4 days';
        if (fieldName.includes('p_birth_weight')) return '2,450 grams';
        if (fieldName.includes('m_length')) return '42.5 cm';
        if (fieldName.includes('m_head_circ')) return '29.8 cm';
        if (fieldName.includes('p_sex')) return 'Male (2)';
        if (fieldName.includes('m_home_feeding')) return 'Human milk only (1)';
        if (fieldName.includes('m_discharge_stoma')) return 'No (0)';
        if (fieldName.includes('feeding')) return 'Human milk only (1)';
        if (fieldName.includes('stoma')) return 'No (0)';
        
        // Fallback to description-based mappings
        if (description.includes('record id') || description.includes('identifier')) return 'K001';
        if (description.includes('gestational age') && description.includes('weeks')) return '32 weeks';
        if (description.includes('gestational age') && description.includes('days')) return '4 days';
        if (description.includes('birth weight')) return '2,450 grams';
        if (description.includes('length') && description.includes('birth')) return '42.5 cm';
        if (description.includes('head circumference')) return '29.8 cm';
        if (description.includes('sex') || description.includes('gender')) return 'Male (2)';
        if (description.includes('feeding') && description.includes('discharge')) return 'Human milk only (1)';
        if (description.includes('stoma')) return 'No (0)';
        if (description.includes('number of infants')) return '2 infants';
        if (description.includes('order of births') || description.includes('rank')) return 'A (first)';
        
        // Handle enum-based fields with actual schema values
        const fieldType = this.getFieldType(field);
        if (fieldType === 'select') {
            const options = this.getFieldOptions(field);
            if (options.length > 0) {
                // Try to pick a meaningful default based on common medical values
                if (fieldName.includes('sex') && options.includes('2')) return 'Male (2)';
                if (fieldName.includes('feeding') && options.includes('1')) return this.getEnumLabelFromDescription(field, '1');
                if (fieldName.includes('stoma') && options.includes('0')) return this.getEnumLabelFromDescription(field, '0');
                if (options.includes('1')) return this.getEnumLabelFromDescription(field, '1');
                if (options.includes('0')) return this.getEnumLabelFromDescription(field, '0');
                return this.getEnumLabelFromDescription(field, options[0]);
            }
        }
        
        // Default values based on field type and schema constraints
        if (fieldType === 'number') {
            const min = this.getFieldMin(field);
            const max = this.getFieldMax(field);
            if (min !== null && max !== null) {
                // Generate sensible values within range
                if (description.includes('weight')) {
                    return Math.floor((min + max) / 2).toString() + ' grams';
                } else if (description.includes('weeks')) {
                    return Math.floor((min + max) / 2).toString() + ' weeks';
                } else if (description.includes('days')) {
                    return Math.floor(Math.random() * (max - min + 1) + min).toString() + ' days';
                } else if (description.includes('cm')) {
                    return (min + (max - min) * 0.6).toFixed(1) + ' cm';
                }
                return Math.floor((min + max) / 2).toString();
            }
            return '42';
        }
        
        if (fieldType === 'date') return '2025-01-13';
        if (fieldType === 'string' && !this.getFieldOptions(field).length) return 'Extracted from clinical notes';
        
        return 'Extracted from clinical notes';
    }

    getEnumLabelFromDescription(field, value) {
        // Extract enum labels from description if available
        if (field.description && field.description.includes('Options:')) {
            const optionsText = field.description.split('Options:')[1];
            const regex = new RegExp(`${value}=([^,]+)`);
            const match = optionsText.match(regex);
            if (match) {
                let label = match[1].trim();
                // Clean up the label (remove trailing periods, extra text after periods)
                label = label.split('.')[0].trim();
                return `${label} (${value})`;
            }
        }
        return `Option ${value}`;
    }

    formatFieldName(fieldName) {
        // Handle specific medical field name mappings
        const fieldMappings = {
            'p_ga_weeks': 'Gestational Age (Weeks)',
            'p_ga_days': 'Gestational Age (Days)', 
            'p_birth_weight': 'Birth Weight',
            'm_length': 'Length at Birth',
            'm_head_circ': 'Head Circumference',
            'p_sex': 'Patient Sex',
            'p_number_of_infants': 'Number of Infants',
            'p_rank': 'Birth Order Rank',
            'p_hospital_id': 'Hospital ID',
            'p_date_of_birth': 'Date of Birth',
            'p_date_of_admission': 'Admission Date',
            'm_nec': 'Necrotizing Enterocolitis',
            'm_sepsis': 'Sepsis Status',
            'm_surfactant': 'Surfactant Treatment',
            'ab_before': 'Antibiotics Before NEC',
            'ab_before_days': 'Antibiotic Days',
            'm_probiotics_b_nec_onset': 'Probiotics Before NEC'
        };
        
        // Use mapping if available, otherwise format the field name
        if (fieldMappings[fieldName]) {
            return fieldMappings[fieldName];
        }
        
        // Generic formatting for unmapped fields
        return fieldName
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .replace(/^(P|M|Ab|Id)\s/, (match) => {
                const prefixes = {
                    'P ': 'Patient ',
                    'M ': 'Medical ',
                    'Ab ': 'Antibiotic ',
                    'Id ': 'ID '
                };
                return prefixes[match] || match;
            })
            .trim();
    }

    updateFieldCounts() {
        const highConfidenceCount = Object.keys(this.categorizedFields.highConfidence).length;
        const doubleCheckCount = Object.keys(this.categorizedFields.doubleCheck).length;
        const manualInputCount = Object.keys(this.categorizedFields.manualInput).length;
        const totalCount = highConfidenceCount + doubleCheckCount + manualInputCount;
        
        console.log('Updating field counts:', {
            highConfidence: highConfidenceCount,
            doubleCheck: doubleCheckCount,
            manualInput: manualInputCount,
            total: totalCount
        });
        
        // Update total fields
        const totalFieldsElement = document.getElementById('total-fields');
        if (totalFieldsElement) {
            totalFieldsElement.textContent = totalCount;
        }
        
        // Update summary percentages (avoid division by zero)
        if (totalCount > 0) {
            const summaryElements = {
                'high-confidence-summary': `${highConfidenceCount} (${Math.round(highConfidenceCount/totalCount*100)}%)`,
                'double-check-summary': `${doubleCheckCount} (${Math.round(doubleCheckCount/totalCount*100)}%)`,
                'manual-input-summary': `${manualInputCount} (${Math.round(manualInputCount/totalCount*100)}%)`
            };
            
            Object.keys(summaryElements).forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = summaryElements[id];
                } else {
                    console.warn(`Summary element with id '${id}' not found`);
                }
            });
        } else {
            ['high-confidence-summary', 'double-check-summary', 'manual-input-summary'].forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = '0 (0%)';
                }
            });
        }

        // Update section counters and Accept All buttons
        setTimeout(() => {
            this.updateSectionCounters();
            this.updateAcceptAllButtons();
            this.updateDeliveryButton();
        }, 100);
    }

    loadSampleData() {
        console.log('Loading sample data for demonstration...');
        // Sample data that matches the JSON schema structure with properties
        this.jsonData = {
            "type": "object",
            "properties": {
                "record_id": {
                    "anyOf": [
                        {
                            "type": "string"
                        },
                        {
                            "type": "null"
                        }
                    ],
                    "default": null,
                    "description": "Record ID - Unique identifier for the medical record.",
                    "group_id": "group_1",
                    "changes": false,
                    "errors": false,
                    "improvements": false,
                    "comments": "Internal development use. K000s for K-patient (K in N)."
                },
                "p_ga_weeks": {
                    "anyOf": [
                        {
                            "type": "number",
                            "minimum": 22,
                            "maximum": 42
                        },
                        {
                            "type": "null"
                        }
                    ],
                    "default": null,
                    "description": "Weeks of gestation - Gestational age in completed weeks (validation: number, range 22-42)",
                    "group_id": "group_1",
                    "changes": false,
                    "errors": false,
                    "improvements": false,
                    "comments": "Works fine."
                },
                "p_ga_days": {
                    "anyOf": [
                        {
                            "type": "number",
                            "minimum": 0,
                            "maximum": 6
                        },
                        {
                            "type": "null"
                        }
                    ],
                    "default": null,
                    "description": "Days of gestation - Additional days beyond completed weeks (validation: number, range 0-6)",
                    "group_id": "group_1",
                    "changes": false,
                    "errors": false,
                    "improvements": true,
                    "comments": "Works fine. We found an error for patient 2: the documentation is contradictory (entries 31 6/7 and 31 1/7 GW)."
                },
                "p_birth_weight": {
                    "anyOf": [
                        {
                            "type": "number",
                            "minimum": 200,
                            "maximum": 5000
                        },
                        {
                            "type": "null"
                        }
                    ],
                    "default": null,
                    "description": "Birth weight in g - Weight at birth in grams (validation: number, range 200-5000)",
                    "group_id": "group_1",
                    "changes": false,
                    "errors": false,
                    "improvements": false,
                    "comments": "Works correctly."
                },
                "p_sex": {
                    "anyOf": [
                        {
                            "type": "string",
                            "enum": ["1", "2", "9"]
                        },
                        {
                            "type": "null"
                        }
                    ],
                    "default": null,
                    "description": "Patient Sex - Gender assignment at birth. Options: 1=female, 2=male, 9=non-determinable",
                    "group_id": "group_1",
                    "changes": false,
                    "errors": false,
                    "improvements": false,
                    "comments": "Works correctly."
                },
                "m_home_feeding": {
                    "anyOf": [
                        {
                            "type": "string",
                            "enum": ["1", "2", "3", "4"]
                        },
                        {
                            "type": "null"
                        }
                    ],
                    "default": null,
                    "description": "Enteral feeding at discharge - Options: 1=human milk only, 2=formula only, 3=human milk in combination with fortifier or formula, 4=none (only parental feeding). Critical: This field should be analyzed only if the patient was discharged alive.",
                    "group_id": "group_2",
                    "changes": false,
                    "errors": false,
                    "improvements": false,
                    "comments": "Critical: This field should be analyzed only if the patient was discharged alive, as its interpretation is not applicable in other clinical outcomes."
                },
                "m_discharge_stoma": {
                    "anyOf": [
                        {
                            "type": "string",
                            "enum": ["0", "1"]
                        },
                        {
                            "type": "null"
                        }
                    ],
                    "default": null,
                    "description": "Discharge with stoma - Options: 0=No, 1=Yes. Critical: This field should be analyzed only if the patient was discharged alive.",
                    "group_id": "group_2",
                    "changes": false,
                    "errors": true,
                    "improvements": false,
                    "comments": "Validation data for patient 2 says 1=Yes, while we say 0=No. Missing data?"
                },
                "consent_status": {
                    "anyOf": [
                        {
                            "type": "string",
                            "enum": ["1", "2", "3", "4", "5", "6", "7"]
                        },
                        {
                            "type": "null"
                        }
                    ],
                    "default": null,
                    "description": "Informed consent status - Patient consent for research participation. Options: 1=Full consent, 2=Partial consent, 3=Pending, 4=Refused, 5=Emergency, 6=Guardian consent, 7=Retrospective consent",
                    "group_id": "group_4",
                    "changes": false,
                    "errors": false,
                    "improvements": false,
                    "comments": "Requires manual input - administrative data not documented in clinical records."
                },
                "patient_ethnicity": {
                    "anyOf": [
                        {
                            "type": "string",
                            "enum": ["1", "2", "3", "4", "5", "6"]
                        },
                        {
                            "type": "null"
                        }
                    ],
                    "default": null,
                    "description": "Patient ethnicity - Ethnic background classification. Options: 1=European, 2=African, 3=Asian, 4=Hispanic/Latino, 5=Middle Eastern, 6=Mixed/Other",
                    "group_id": "group_4",
                    "changes": false,
                    "errors": false,
                    "improvements": false,
                    "comments": "Manual input required. AI can provide guidance based on extracted nationality information."
                }
            },
            "required": [],
            "additionalProperties": true
        };
        
        console.log('Sample data loaded:', this.jsonData);
        this.categorizeFields();
        this.renderFields();
        this.updateFieldCounts();
    }

    // Results Dashboard
    switchResultsSection(sectionId) {
        // Update navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        event.currentTarget.classList.add('active');

        // Update content
        document.querySelectorAll('.results-section').forEach(section => {
            section.classList.remove('active');
        });
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    }

    // Processing Popup Management
    toggleProcessingPopup() {
        const popupDetails = document.getElementById('popupDetails');
        const popupToggle = document.getElementById('popupToggle');
        
        if (popupDetails.classList.contains('show')) {
            popupDetails.classList.remove('show');
            popupToggle.classList.remove('expanded');
        } else {
            popupDetails.classList.add('show');
            popupToggle.classList.add('expanded');
        }
    }

    updateProcessingPopup(stage, progress, timeRemaining) {
        const popupProcessingText = document.getElementById('popupProcessingText');
        const progressFillSmall = document.getElementById('progressFillSmall');
        const popupProgressText = document.getElementById('popupProgressText');
        const popupProgressTime = document.getElementById('popupProgressTime');
        const popupStages = document.querySelectorAll('.popup-stage');

        if (popupProcessingText) {
            popupProcessingText.textContent = stage;
        }
        if (progressFillSmall) {
            progressFillSmall.style.width = `${progress}%`;
        }
        if (popupProgressText) {
            popupProgressText.textContent = stage;
        }
        if (popupProgressTime) {
            popupProgressTime.textContent = timeRemaining > 0 ? `${Math.ceil(timeRemaining)}s remaining` : 'Complete';
        }

        // Update popup stages based on current processing stage
        popupStages.forEach((stageEl, index) => {
            stageEl.classList.remove('active', 'completed');
            if (index < this.currentProcessingStage) {
                stageEl.classList.add('completed');
            } else if (index === this.currentProcessingStage) {
                stageEl.classList.add('active');
            }
        });
    }

    hideProcessingPopup() {
        const popup = document.getElementById('processingPopup');
        if (popup) {
            // Mark as completed first
            popup.classList.add('completed');
            
            // Update to show completion
            const popupProcessingText = document.getElementById('popupProcessingText');
            const popupIcon = popup.querySelector('.popup-icon i');
            if (popupProcessingText) {
                popupProcessingText.textContent = 'Processing Complete!';
            }
            if (popupIcon) {
                popupIcon.className = 'fas fa-check-circle';
            }
            
            // Hide after a delay
            setTimeout(() => {
                popup.classList.add('hidden');
            }, 3000);
        }
    }

    // Field Editing and Actions
    enableFieldEditing(fieldElement) {
        if (fieldElement.classList.contains('editing')) return;

        const originalValue = fieldElement.dataset.originalValue || fieldElement.textContent;
        fieldElement.classList.add('editing');
        fieldElement.contentEditable = true;
        fieldElement.focus();

        // Handle blur event to save changes
        const handleBlur = () => {
            fieldElement.classList.remove('editing');
            fieldElement.contentEditable = false;
            fieldElement.removeEventListener('blur', handleBlur);
            fieldElement.removeEventListener('keydown', handleKeydown);
        };

        // Handle Enter key to save
        const handleKeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                fieldElement.blur();
            }
        };

        fieldElement.addEventListener('blur', handleBlur);
        fieldElement.addEventListener('keydown', handleKeydown);
    }

    handleFieldAccept(button) {
        const fieldCard = button.closest('.field-card');
        const fieldValue = fieldCard.querySelector('.field-value');
        const editBtn = fieldCard.querySelector('.btn-edit');
        const fieldId = fieldCard.dataset.fieldId;
        const category = fieldCard.dataset.category;
        
        // For manual input fields, validate they are not empty
        if (category === 'manual-input') {
            const manualInput = fieldCard.querySelector('.field-input, .field-select');
            if (manualInput && (!manualInput.value || manualInput.value.trim() === '')) {
                this.showNotification('Please fill in the field before saving', 'warning');
                return; // Don't save empty fields
            }
        }
        
        button.style.background = 'var(--success)';
        button.textContent = category === 'manual-input' ? '✓ Saved' : '✓ Accepted';
        button.disabled = true;
        button.style.opacity = '0.8';

        // Mark field as accepted
        this.fieldAcceptanceState[fieldId] = true;
        fieldCard.classList.remove('pending');
        fieldCard.classList.add('accepted');

        // Handle edit button display for all field types
        if (editBtn) {
            editBtn.style.display = 'inline-block';
            editBtn.textContent = '✏️ Edit';
        }

        // For manual input fields, disable the input but keep it accessible for editing
        if (category === 'manual-input') {
            const manualInput = fieldCard.querySelector('.field-input, .field-select');
            if (manualInput) {
                manualInput.disabled = true;
                manualInput.style.opacity = '0.7';
                // Keep event listener for when edit is clicked
                manualInput.addEventListener('input', () => {
                    if (!this.fieldAcceptanceState[fieldId]) {
                        this.handleFieldEdit(fieldCard);
                    }
                });
            }
        } else {
            // For high-confidence and double-check fields, disable direct editing on field value
            if (fieldValue && fieldValue.classList.contains('editable')) {
                fieldValue.classList.remove('editable');
                fieldValue.style.cursor = 'default';
            }
        }

        // Hide other action buttons
        const otherButtons = fieldCard.querySelectorAll('.btn-review');
        otherButtons.forEach(btn => {
            btn.style.display = 'none';
        });

        // Update counters and Accept All button
        this.updateSectionCounters();
        this.updateAcceptAllButtons();
        this.updateDeliveryButton();
        this.updateDeliveryButton();
    }

    handleFieldEdit(fieldCard) {
        const fieldValue = fieldCard.querySelector('.field-value');
        const acceptBtn = fieldCard.querySelector('.btn-accept');
        const reviewBtn = fieldCard.querySelector('.btn-review');
        const editBtn = fieldCard.querySelector('.btn-edit');
        const fieldId = fieldCard.dataset.fieldId;
        const category = fieldCard.dataset.category;
        
        // Mark field as no longer accepted
        this.fieldAcceptanceState[fieldId] = false;
        fieldCard.classList.remove('accepted');
        fieldCard.classList.add('pending');

        // Hide delivery notification when any field is edited
        this.hideDeliveryNotification();

        // Reset accept button
        if (acceptBtn) {
            acceptBtn.style.background = 'var(--success)';
            acceptBtn.textContent = category === 'manual-input' ? '✓ Save' : '✓ Accept';
            acceptBtn.disabled = false;
            acceptBtn.style.opacity = '1';
        }

        // Hide edit button
        if (editBtn) {
            editBtn.style.display = 'none';
        }

        // Handle field re-editing based on category
        if (category === 'manual-input') {
            // Re-enable manual input fields
            const manualInput = fieldCard.querySelector('.field-input, .field-select');
            if (manualInput) {
                manualInput.disabled = false;
                manualInput.style.opacity = '1';
                manualInput.focus(); // Focus the input for immediate editing
            }
        } else {
            // For non-manual input fields, re-enable editing on field value
            if (fieldValue) {
                fieldValue.classList.add('editable');
                fieldValue.style.cursor = 'pointer';
                // Trigger edit mode
                this.enableFieldEditing(fieldValue);
            }

            // Show review button again if it exists
            if (reviewBtn) {
                reviewBtn.style.display = 'inline-block';
            }
        }

        // Update counters and Accept All button
        this.updateSectionCounters();
        this.updateAcceptAllButtons();
    }

    handleAcceptAll(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;

        const acceptButtons = section.querySelectorAll('.btn-accept:not(:disabled)');
        acceptButtons.forEach(button => {
            this.handleFieldAccept(button);
        });

        this.showNotification(`All fields in ${this.getSectionDisplayName(sectionId)} have been accepted`, 'success');
    }

    updateSectionCounters() {
        const sections = ['manual-input', 'high-confidence', 'double-check'];
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (!section) return;

            const fieldCards = section.querySelectorAll('.field-card');
            const acceptedFields = section.querySelectorAll('.field-card.accepted');
            const total = fieldCards.length;
            const accepted = acceptedFields.length;

            // Update tab counter
            const tabCounter = document.getElementById(`${sectionId}-count`);
            if (tabCounter) {
                tabCounter.textContent = `${accepted}/${total}`;
                tabCounter.className = `field-count ${accepted === total && total > 0 ? 'complete' : ''}`;
            }
        });
    }

    updateAcceptAllButtons() {
        const sections = ['high-confidence', 'double-check']; // Removed manual-input
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (!section) return;

            const fieldCards = section.querySelectorAll('.field-card');
            const acceptedFields = section.querySelectorAll('.field-card.accepted');
            const acceptAllBtn = section.querySelector('.btn-accept-all');
            
            if (acceptAllBtn && fieldCards.length > 0) {
                const allAccepted = acceptedFields.length === fieldCards.length;
                
                if (allAccepted) {
                    acceptAllBtn.innerHTML = '<i class="fas fa-check-double"></i> All Accepted';
                    acceptAllBtn.disabled = true;
                    acceptAllBtn.style.background = 'var(--success)';
                } else {
                    acceptAllBtn.innerHTML = '<i class="fas fa-check-double"></i> Accept All';
                    acceptAllBtn.disabled = false;
                    acceptAllBtn.style.background = 'var(--primary)';
                }
            }
        });
    }

    updateDeliveryButton() {
        const deliveryNotification = document.getElementById('deliveryNotification');
        if (!deliveryNotification) return;

        // Check if all fields across all sections are accepted
        const allFieldCards = document.querySelectorAll('.field-card');
        const acceptedFieldCards = document.querySelectorAll('.field-card.accepted');
        const allAccepted = allFieldCards.length > 0 && allFieldCards.length === acceptedFieldCards.length;

        if (allAccepted) {
            this.showDeliveryNotification();
        } else {
            this.hideDeliveryNotification();
        }
    }

    showDeliveryNotification() {
        const deliveryNotification = document.getElementById('deliveryNotification');
        if (deliveryNotification) {
            deliveryNotification.style.display = 'block';
            // Add a small delay for the animation to trigger properly
            setTimeout(() => {
                deliveryNotification.classList.add('visible');
            }, 100);
        }
    }

    hideDeliveryNotification() {
        const deliveryNotification = document.getElementById('deliveryNotification');
        if (deliveryNotification) {
            deliveryNotification.classList.remove('visible');
            deliveryNotification.style.display = 'none';
        }
    }

    async handleDelivery() {
        // Handle both old and new delivery buttons
        const deliveryBtn = document.querySelector('.btn-delivery') || document.querySelector('.btn-delivery-fixed');
        if (!deliveryBtn) return;

        // Show delivery process
        const originalText = deliveryBtn.innerHTML;
        deliveryBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Delivering...';
        deliveryBtn.disabled = true;

        try {
            // Simulate delivery process
            await this.delay(2000);
            
            this.showNotification('Patient data delivered successfully!', 'success');
            
            // Hide the delivery notification
            this.hideDeliveryNotification();
            
            // Return to User Portal after delivery
            setTimeout(() => {
                this.currentStage = 2;
                this.showStage(2);
                // Reset field states but don't do full reset until new patient is started
                this.fieldAcceptanceState = {};
                this.updateUserPortalStats(); // Update stats after delivery
            }, 1500);

        } catch (error) {
            this.showNotification('Delivery failed. Please try again.', 'error');
            deliveryBtn.innerHTML = originalText;
            deliveryBtn.disabled = false;
        }
    }

    showPDFReview() {
        const reviewPanel = document.getElementById('pdfReviewPanel');
        const overlay = document.getElementById('pdfOverlay');
        
        if (reviewPanel) {
            // Show overlay first
            if (overlay) {
                overlay.style.display = 'block';
                setTimeout(() => overlay.classList.add('active'), 10);
            }
            
            // Show panel
            reviewPanel.classList.add('active');
            
            // Simulate loading a PDF from the medical documents
            const firstDoc = this.medicalDocuments.length > 0 ? this.medicalDocuments[0].name : 'medical_report.pdf';
            const pdfTitle = reviewPanel.querySelector('.pdf-title');
            if (pdfTitle) {
                pdfTitle.textContent = firstDoc;
            }
            
            // Focus the panel for better keyboard interaction
            reviewPanel.focus();
            
            // Prevent body scrolling when panel is open
            document.body.style.overflow = 'hidden';
        }
    }

    closePDFReview() {
        const reviewPanel = document.getElementById('pdfReviewPanel');
        const overlay = document.getElementById('pdfOverlay');
        
        if (reviewPanel) {
            reviewPanel.classList.remove('active');
            
            // Hide overlay
            if (overlay) {
                overlay.classList.remove('active');
                setTimeout(() => overlay.style.display = 'none', 300);
            }
            
            // Restore body scrolling
            document.body.style.overflow = 'auto';
            
            // Remove focus from panel
            reviewPanel.blur();
        }
    }

    getSectionDisplayName(sectionId) {
        const names = {
            'manual-input': 'Manual Input',
            'high-confidence': 'High Confidence',
            'double-check': 'Double Check'
        };
        return names[sectionId] || sectionId;
    }

    // Utility Functions
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;

        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: this.getNotificationColor(type),
            color: 'white',
            padding: '15px 20px',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: '10000',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            maxWidth: '400px',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease'
        });

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after delay
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            warning: 'exclamation-triangle',
            error: 'times-circle',
            info: 'info-circle'
        };
        return icons[type] || icons.info;
    }

    getNotificationColor(type) {
        const colors = {
            success: 'var(--success)',
            warning: 'var(--warning)',
            error: 'var(--danger)',
            info: 'var(--primary)'
        };
        return colors[type] || colors.info;
    }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    window.medixtractApp = new MediXtractApp();
});

// Global error handling
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
    if (window.medixtractApp) {
        window.medixtractApp.showNotification('An unexpected error occurred', 'error');
    }
});

// Handle window resize for responsive behavior
window.addEventListener('resize', () => {
    // Update any responsive elements if needed
    const results = document.querySelector('.results-container');
    if (results && window.innerWidth <= 768) {
        results.style.flexDirection = 'column';
    } else if (results) {
        results.style.flexDirection = 'row';
    }
});
