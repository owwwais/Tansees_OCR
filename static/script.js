// Global Variables
let currentFile = null;
let isProcessing = false;

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const uploadIcon = document.getElementById('uploadIcon');
const uploadContent = document.getElementById('uploadContent');
const fileInput = document.getElementById('fileInput');
const filePreview = document.getElementById('filePreview');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const removeFileBtn = document.getElementById('removeFileBtn');
const processBtn = document.getElementById('processBtn');
const uploadStatus = document.getElementById('uploadStatus');
const statusText = document.getElementById('statusText');
const progressSection = document.getElementById('progressSection');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const resultsSection = document.getElementById('resultsSection');
const textOutput = document.getElementById('textOutput');
const textPlaceholder = document.getElementById('textPlaceholder');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const charCount = document.getElementById('charCount');
const wordCount = document.getElementById('wordCount');
const lineCount = document.getElementById('lineCount');
const plainTextBtn = document.getElementById('plainTextBtn');
const formattedTextBtn = document.getElementById('formattedTextBtn');
const themeToggle = document.getElementById('themeToggle');
const scrollToTopBtn = document.getElementById('scrollToTop');
const arabicBtn = document.getElementById('arabicBtn');
const englishBtn = document.getElementById('englishBtn');
const shortcutsModal = document.getElementById('shortcutsModal');
const closeShortcutsModal = document.getElementById('closeShortcutsModal');
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');
const timeRemaining = document.getElementById('timeRemaining');
const percentage = document.getElementById('percentage');
const demoAlert = document.getElementById('demoAlert');
const closeDemoAlert = document.getElementById('closeDemoAlert');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

function setupEventListeners() {
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop events
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Click on upload area
    uploadArea.addEventListener('click', (e) => {
        if (!filePreview.style.display || filePreview.style.display === 'none') {
            fileInput.click();
        }
    });
    
    // File preview events
    removeFileBtn.addEventListener('click', removeFile);
    processBtn.addEventListener('click', startProcessing);
    
    // Action buttons
    copyBtn.addEventListener('click', copyText);
    downloadBtn.addEventListener('click', downloadText);
    
    // Format buttons
    plainTextBtn.addEventListener('click', () => switchFormat('plain'));
    formattedTextBtn.addEventListener('click', () => switchFormat('formatted'));
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Scroll to top
    scrollToTopBtn.addEventListener('click', scrollToTop);
    
    // Initialize theme
    initializeTheme();
    
    // Scroll event for scroll to top button
    window.addEventListener('scroll', handleScroll);
    
    // Language buttons
    arabicBtn.addEventListener('click', () => switchLanguage('ar'));
    englishBtn.addEventListener('click', () => switchLanguage('en'));
    
    // Modal events
    closeShortcutsModal.addEventListener('click', closeModal);
    shortcutsModal.addEventListener('click', (e) => {
        if (e.target === shortcutsModal) closeModal();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Demo alert
    closeDemoAlert.addEventListener('click', () => {
        demoAlert.style.display = 'none';
    });
}

// File Handling Functions
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processFile(file);
    }
}

function handleDragOver(event) {
    event.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function processFile(file) {
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
        showError('نوع الملف غير مدعوم. يرجى اختيار ملف PDF أو صورة.');
        return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showError('حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت.');
        return;
    }
    
    currentFile = file;
    showFilePreview(file);
}

// File Preview Functions
function showFilePreview(file) {
    // Update file info
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    
    // Show preview and hide upload content
    uploadContent.style.display = 'none';
    filePreview.style.display = 'block';
    
    // Update upload area styling
    uploadArea.classList.remove('dragover');
    uploadArea.style.borderColor = '#28a745';
    uploadArea.style.backgroundColor = '#f8fff9';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function removeFile() {
    currentFile = null;
    fileInput.value = '';
    
    // Hide preview and show upload content
    filePreview.style.display = 'none';
    uploadContent.style.display = 'block';
    
    // Reset upload area styling
    uploadArea.style.borderColor = '#e1e5e9';
    uploadArea.style.backgroundColor = 'transparent';
    
    // Hide any status messages
    uploadStatus.style.display = 'none';
}

function startProcessing() {
    if (!currentFile) return;
    
    processBtn.disabled = true;
    processBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12,6 12,12 16,14"></polyline>
        </svg>
        جاري المعالجة...
    `;
    
    uploadFile(currentFile);
}

// Upload and Processing Functions
async function uploadFile(file) {
    try {
        showUploadStatus('جاري رفع الملف...');
        showProgress('جاري رفع الملف...', 10);
        
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('فشل في رفع الملف');
        }
        
        const result = await response.json();
        showUploadStatus('تم رفع الملف بنجاح. جاري المعالجة...');
        showProgress('تم رفع الملف بنجاح. جاري المعالجة...', 30);
        
        // Start OCR processing
        await processOCR(result.filename);
        
    } catch (error) {
        console.error('Upload error:', error);
        showError('حدث خطأ أثناء رفع الملف: ' + error.message);
        hideProgress();
        hideUploadStatus();
        resetProcessButton();
    }
}

async function processOCR(filename) {
    try {
        showProgress('جاري استخراج النص...', 50);
        showUploadStatus('جاري معالجة OCR...');
        
        const formData = new FormData();
        formData.append('filename', filename);
        
        const response = await fetch('/api/process-ocr', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'فشل في معالجة OCR');
        }
        
        const result = await response.json();
        showProgress('تم استخراج النص بنجاح!', 100);
        showUploadStatus('تم استخراج النص بنجاح!');
        
        // عرض النتائج الفعلية
        setTimeout(() => {
            hideProgress();
            hideUploadStatus();
            showResults(result.extracted_text || result.message || 'تم استخراج النص بنجاح');
            resetProcessButton();
        }, 500);
        
    } catch (error) {
        console.error('OCR error:', error);
        showError('حدث خطأ أثناء معالجة OCR: ' + error.message);
        hideProgress();
        hideUploadStatus();
        resetProcessButton();
    }
}

// UI Functions
function showProgress(message, percentage) {
    progressSection.style.display = 'block';
    progressText.textContent = message;
    progressFill.style.width = percentage + '%';
}

function hideProgress() {
    progressSection.style.display = 'none';
    progressFill.style.width = '0%';
}

function showUploadStatus(message) {
    statusText.textContent = message;
    uploadStatus.style.display = 'flex';
}

function hideUploadStatus() {
    uploadStatus.style.display = 'none';
}

function resetProcessButton() {
    processBtn.disabled = false;
    processBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12,6 12,12 16,14"></polyline>
        </svg>
        بدء المعالجة
    `;
}

function showResults(text) {
    if (!text || text.trim() === '') {
        textOutput.textContent = 'لم يتم العثور على نص في الملف المرفوع.';
        textOutput.style.color = '#666';
        textOutput.style.fontStyle = 'italic';
    } else {
        textOutput.textContent = text;
        textOutput.style.color = '#333';
        textOutput.style.fontStyle = 'normal';
    }
    
    // Hide placeholder and show text
    textPlaceholder.style.display = 'none';
    textOutput.style.display = 'block';
    
    // Update statistics
    updateTextStats(text);
    
    // Show results section
    resultsSection.style.display = 'block';
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function updateTextStats(text) {
    if (!text) {
        charCount.textContent = '0';
        wordCount.textContent = '0';
        lineCount.textContent = '0';
        return;
    }
    
    // Character count (excluding spaces)
    const chars = text.replace(/\s/g, '').length;
    charCount.textContent = chars.toLocaleString('ar-EG');
    
    // Word count
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    wordCount.textContent = words.toLocaleString('ar-EG');
    
    // Line count
    const lines = text.split('\n').filter(line => line.trim().length > 0).length;
    lineCount.textContent = lines.toLocaleString('ar-EG');
}

function switchFormat(format) {
    // Update button states
    plainTextBtn.classList.toggle('active', format === 'plain');
    formattedTextBtn.classList.toggle('active', format === 'formatted');
    
    // Apply formatting
    if (format === 'formatted') {
        textOutput.style.fontFamily = 'IBM Plex Sans Arabic, Cairo, sans-serif';
        textOutput.style.fontSize = '1.1rem';
        textOutput.style.lineHeight = '2';
        textOutput.style.letterSpacing = '0.5px';
    } else {
        textOutput.style.fontFamily = 'IBM Plex Sans Arabic, Cairo, sans-serif';
        textOutput.style.fontSize = '1rem';
        textOutput.style.lineHeight = '1.8';
        textOutput.style.letterSpacing = 'normal';
    }
}

function showError(message) {
    // Create error notification
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
        z-index: 1000;
        font-weight: 600;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Action Functions
function copyText() {
    const text = textOutput.textContent;
    if (text && text.trim() !== '' && !text.includes('لم يتم العثور على نص')) {
        navigator.clipboard.writeText(text).then(() => {
            showSuccessMessage('تم نسخ النص إلى الحافظة');
            
            // Visual feedback
            copyBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
                تم النسخ
            `;
            copyBtn.style.background = 'var(--gunmetal)';
            
            setTimeout(() => {
                copyBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    نسخ النص
                `;
                copyBtn.style.background = 'var(--walnut-brown)';
            }, 2000);
        }).catch(() => {
            showError('فشل في نسخ النص');
        });
    } else {
        showError('لا يوجد نص للنسخ');
    }
}

function downloadText() {
    const text = textOutput.textContent;
    if (text && text.trim() !== '' && !text.includes('لم يتم العثور على نص')) {
        // Generate filename with timestamp
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `extracted_text_${timestamp}.txt`;
        
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showSuccessMessage('تم تحميل النص بنجاح');
        
        // Visual feedback
        downloadBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
            تم التحميل
        `;
        downloadBtn.style.background = 'var(--black)';
        
        setTimeout(() => {
            downloadBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7,10 12,15 17,10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                تحميل النص
            `;
            downloadBtn.style.background = 'var(--gunmetal)';
        }, 2000);
    } else {
        showError('لا يوجد نص للتحميل');
    }
}

function showSuccessMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
        z-index: 1000;
        font-weight: 600;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Utility Functions
function resetForm() {
    fileInput.value = '';
    currentFile = null;
    isProcessing = false;
    hideProgress();
    hideUploadStatus();
    resultsSection.style.display = 'none';
    textOutput.textContent = '';
    textPlaceholder.style.display = 'flex';
    textOutput.style.display = 'none';
    updateTextStats('');
    removeFile();
}

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Add animation effect
    themeToggle.style.transform = 'rotate(180deg)';
    setTimeout(() => {
        themeToggle.style.transform = 'rotate(0deg)';
    }, 300);
}

// Scroll Management
function handleScroll() {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.style.display = 'flex';
        scrollToTopBtn.style.opacity = '1';
    } else {
        scrollToTopBtn.style.opacity = '0';
        setTimeout(() => {
            if (window.pageYOffset <= 300) {
                scrollToTopBtn.style.display = 'none';
            }
        }, 300);
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Performance Optimizations
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimize scroll handler
const optimizedScrollHandler = debounce(handleScroll, 10);
window.addEventListener('scroll', optimizedScrollHandler);

// Language Management
function switchLanguage(lang) {
    // Update button states
    arabicBtn.classList.toggle('active', lang === 'ar');
    englishBtn.classList.toggle('active', lang === 'en');
    
    // Store language preference
    localStorage.setItem('language', lang);
    
    // Update document direction
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
    
    // You can add more language-specific logic here
    console.log(`Language switched to: ${lang}`);
}

// Enhanced Progress Management
function updateProgressSteps(step) {
    // Reset all steps
    [step1, step2, step3].forEach(s => {
        s.classList.remove('active', 'completed');
    });
    
    // Activate current step and complete previous steps
    for (let i = 1; i <= 3; i++) {
        const stepElement = document.getElementById(`step${i}`);
        if (i < step) {
            stepElement.classList.add('completed');
        } else if (i === step) {
            stepElement.classList.add('active');
        }
    }
}

function updateProgressDetails(percent, estimatedTime) {
    percentage.textContent = `${percent}%`;
    timeRemaining.textContent = estimatedTime || '--';
}

// Modal Management
function openModal() {
    shortcutsModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    shortcutsModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Keyboard Shortcuts
function handleKeyboardShortcuts(event) {
    // Ctrl+O: Open file
    if (event.ctrlKey && event.key === 'o') {
        event.preventDefault();
        fileInput.click();
    }
    
    // Ctrl+C: Copy text (only if text is selected or results are shown)
    if (event.ctrlKey && event.key === 'c') {
        if (resultsSection.style.display !== 'none') {
            event.preventDefault();
            copyText();
        }
    }
    
    // Ctrl+S: Save text
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        downloadText();
    }
    
    // Ctrl+D: Toggle theme
    if (event.ctrlKey && event.key === 'd') {
        event.preventDefault();
        toggleTheme();
    }
    
    // Ctrl+L: Toggle language
    if (event.ctrlKey && event.key === 'l') {
        event.preventDefault();
        const currentLang = document.documentElement.getAttribute('lang') || 'ar';
        switchLanguage(currentLang === 'ar' ? 'en' : 'ar');
    }
    
    // F1: Show shortcuts
    if (event.key === 'F1') {
        event.preventDefault();
        openModal();
    }
    
    // Esc: Close modals
    if (event.key === 'Escape') {
        closeModal();
    }
}

// Enhanced Upload Function
async function uploadFile(file) {
    try {
        updateProgressSteps(1);
        showUploadStatus('جاري رفع الملف...');
        showProgress('جاري رفع الملف...', 10);
        updateProgressDetails(10, '30 ثانية');
        
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('فشل في رفع الملف');
        }
        
        const result = await response.json();
        updateProgressSteps(2);
        showUploadStatus('تم رفع الملف بنجاح. جاري المعالجة...');
        showProgress('تم رفع الملف بنجاح. جاري المعالجة...', 30);
        updateProgressDetails(30, '20 ثانية');
        
        // Start OCR processing
        await processOCR(result.filename);
        
    } catch (error) {
        console.error('Upload error:', error);
        showError('حدث خطأ أثناء رفع الملف: ' + error.message);
        hideProgress();
        hideUploadStatus();
        resetProcessButton();
    }
}

// Enhanced OCR Processing
async function processOCR(filename) {
    try {
        updateProgressSteps(2);
        showProgress('جاري استخراج النص...', 50);
        showUploadStatus('جاري معالجة OCR...');
        updateProgressDetails(50, '15 ثانية');
        
        const formData = new FormData();
        formData.append('filename', filename);
        
        const response = await fetch('/api/process-ocr', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'فشل في معالجة OCR');
        }
        
        const result = await response.json();
        updateProgressSteps(3);
        showProgress('تم استخراج النص بنجاح!', 100);
        showUploadStatus('تم استخراج النص بنجاح!');
        updateProgressDetails(100, 'مكتمل');
        
        // عرض النتائج الفعلية
        setTimeout(() => {
            hideProgress();
            hideUploadStatus();
            showResults(result.extracted_text || result.message || 'تم استخراج النص بنجاح');
            resetProcessButton();
        }, 500);
        
    } catch (error) {
        console.error('OCR error:', error);
        showError('حدث خطأ أثناء معالجة OCR: ' + error.message);
        hideProgress();
        hideUploadStatus();
        resetProcessButton();
    }
}
