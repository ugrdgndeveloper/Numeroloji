// DOM Elements
const inputText = document.getElementById('inputText');
const charCount = document.getElementById('charCount');
const loading = document.getElementById('loading');
const errorBox = document.getElementById('errorBox');
const resultSection = document.getElementById('resultSection');
const totalValue = document.getElementById('totalValue');
const normalizedText = document.getElementById('normalizedText');
const summaryBody = document.getElementById('summaryBody');
const breakdownBody = document.getElementById('breakdownBody');
const resultSystem = document.getElementById('resultSystem');
const resultLanguage = document.getElementById('resultLanguage');

// Current alphabet and calculation type
var currentAlphabet = 'Arabic';
var currentCalculationType = 'Normal';

// Alphabet info
var alphabetInfo = {
    'Arabic': { system: 'Ebced', language: 'Arapça', direction: 'rtl' },
    'Hebrew': { system: 'Gematria', language: 'İbranice', direction: 'rtl' },
    'Greek': { system: 'Isopsephy', language: 'Yunanca', direction: 'ltr' }
};

// Select alphabet
function selectAlphabet(alphabet) {
    currentAlphabet = alphabet;

    // Update tab buttons
    var tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(function (tab) {
        if (tab.getAttribute('data-alphabet') === alphabet) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Show/hide keyboards
    var keyboards = document.querySelectorAll('.keyboard-section');
    keyboards.forEach(function (kb) {
        if (kb.id === 'keyboard-' + alphabet) {
            kb.style.display = 'block';
        } else {
            kb.style.display = 'none';
        }
    });

    // Reset calculation type for Arabic
    if (alphabet === 'Arabic') {
        selectCalculationType('Normal');
    }

    // Update text direction
    var info = alphabetInfo[alphabet];
    if (inputText) {
        inputText.style.direction = info.direction;
        inputText.style.textAlign = info.direction === 'rtl' ? 'right' : 'left';

        // Clear text when switching alphabets
        inputText.value = '';
        inputText.focus();
    }

    // Update character count
    if (charCount) {
        charCount.textContent = '0 harf';
        charCount.style.color = '#667eea';
    }

    // Reinitialize keyboard for new alphabet
    initKeyboard();

    // Hide results when switching
    hideResults();
    hideError();

    console.log('Alphabet changed to:', alphabet);
}

// Initialize keyboard
function initKeyboard() {
    var activeKeyboard = document.getElementById('keyboard-' + currentAlphabet);
    if (!activeKeyboard) return;

    var keys = activeKeyboard.querySelectorAll('.key[data-char]');
    var backspaceKey = document.getElementById('backspaceKey-' + currentAlphabet);

    // Remove old listeners by cloning
    keys.forEach(function (key) {
        var newKey = key.cloneNode(true);
        key.parentNode.replaceChild(newKey, key);
    });

    // Get fresh references
    keys = activeKeyboard.querySelectorAll('.key[data-char]');

    // Add click event to all keys
    keys.forEach(function (key) {
        key.addEventListener('click', function () {
            var char = this.getAttribute('data-char');
            insertCharacter(char);

            // Visual feedback
            var self = this;
            self.style.transform = 'scale(0.95)';
            setTimeout(function () {
                self.style.transform = '';
            }, 100);
        });
    });

    // Backspace key
    if (backspaceKey) {
        var newBackspace = backspaceKey.cloneNode(true);
        backspaceKey.parentNode.replaceChild(newBackspace, backspaceKey);

        newBackspace.addEventListener('click', function () {
            deleteCharacter();

            var self = this;
            self.style.transform = 'scale(0.95)';
            setTimeout(function () {
                self.style.transform = '';
            }, 100);
        });
    }

    console.log('Keyboard initialized for', currentAlphabet, 'with', keys.length, 'keys');
}

// Insert character at cursor position
function insertCharacter(char) {
    if (!inputText) {
        console.error('inputText not found');
        return;
    }

    var start = inputText.selectionStart;
    var end = inputText.selectionEnd;
    var text = inputText.value;

    inputText.value = text.substring(0, start) + char + text.substring(end);

    var newPos = start + char.length;
    inputText.setSelectionRange(newPos, newPos);

    inputText.focus();
    updateCharCount();
}

// Delete character before cursor
function deleteCharacter() {
    if (!inputText) return;

    var start = inputText.selectionStart;
    var end = inputText.selectionEnd;
    var text = inputText.value;

    if (start !== end) {
        inputText.value = text.substring(0, start) + text.substring(end);
        inputText.setSelectionRange(start, start);
    } else if (start > 0) {
        inputText.value = text.substring(0, start - 1) + text.substring(start);
        inputText.setSelectionRange(start - 1, start - 1);
    }

    inputText.focus();
    updateCharCount();
}

// Update character count
function updateCharCount() {
    if (!charCount || !inputText) return;

    var count = inputText.value.length;
    charCount.textContent = count.toLocaleString('tr-TR');

    if (count > 10000) {
        charCount.style.color = '#ef4444';
    } else if (count > 8000) {
        charCount.style.color = '#f59e0b';
    } else {
        charCount.style.color = '#667eea';
    }
}

// Character counter on input
if (inputText) {
    inputText.addEventListener('input', updateCharCount);
}

// Keyboard shortcuts
if (inputText) {
    inputText.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            calculate();
        }
        if (e.key === 'Escape') {
            clearAll();
        }
    });
}

// Shamsi & Qamari Sets
const shamsiLetters = ['ت', 'ث', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ل', 'ن'];
const qamariLetters = ['ا', 'ب', 'ج', 'ح', 'خ', 'ع', 'غ', 'ف', 'ق', 'ك', 'م', 'ه', 'و', 'ي'];

// Modal Functions
function showHelp(event, modalId) {
    event.stopPropagation(); // Prevent clicking parent card
    var modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    var modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close modal when clicking outside
window.onclick = function (event) {
    if (event.target.classList.contains('custom-modal')) {
        event.target.style.display = "none";
    }
}

// Select calculation type
function selectCalculationType(type) {
    if (currentAlphabet !== 'Arabic') return;

    currentCalculationType = type;

    // Update Variation Cards
    var cards = document.querySelectorAll('.variation-card');
    cards.forEach(function (card) {
        if (card.getAttribute('data-type') === type) {
            card.classList.add('active');
            card.style.borderColor = '#667eea';
            card.style.backgroundColor = '#eff6ff';
        } else {
            card.classList.remove('active');
            card.style.borderColor = '#e2e8f0';
            card.style.backgroundColor = 'white';
        }
    });

    // Update SQ Cards
    var sqCards = document.querySelectorAll('.sq-card');
    sqCards.forEach(function (card) {
        if (card.getAttribute('data-type') === type) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });

    // Recalculate if there is text
    if (inputText && inputText.value.trim()) {
        calculate();
    }
}

// Main calculation function
async function calculate() {
    var text = inputText ? inputText.value.trim() : '';

    if (!text) {
        showError('⚠️ Lütfen hesaplamak için bir metin girin!');
        if (inputText) inputText.focus();
        return;
    }

    if (text.length > 10000) {
        showError('⚠️ Metin çok uzun! Maksimum 10.000 karakter olmalıdır.');
        return;
    }

    hideError();
    showLoading(true);
    hideResults();

    try {
        var response = await fetch('/api/numerology', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Text: text,
                Alphabet: currentAlphabet === 'Arabic' ? 0 : (currentAlphabet === 'Hebrew' ? 1 : 2),
                Type: getCalculationTypeId(currentCalculationType)
            })
        });

        if (!response.ok) {
            var error = await response.json();
            throw new Error(error.Message || 'HTTP ' + response.status);
        }

        var result = await response.json();
        displayResult(result);

    } catch (error) {
        console.error('Calculation error:', error);
        showError('❌ Hata: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// Display results
function displayResult(result) {
    if (!result || typeof result.Total === 'undefined') {
        showError('❌ Geçersiz sonuç alındı!');
        return;
    }

    // Filter for Shamsi/Qamari
    var displayRows = result.Rows;
    var displayTotal = result.Total;

    if (currentAlphabet === 'Arabic') {
        if (currentCalculationType === 'Shamsi') {
            displayRows = result.Rows.filter(r => shamsiLetters.includes(r.Char));
            displayTotal = displayRows.reduce((sum, r) => sum + r.Value, 0);
        } else if (currentCalculationType === 'Qamari') {
            displayRows = result.Rows.filter(r => qamariLetters.includes(r.Char));
            displayTotal = displayRows.reduce((sum, r) => sum + r.Value, 0);
        }
    }

    // Update result header
    var info = alphabetInfo[currentAlphabet];
    if (resultSystem) resultSystem.textContent = info.system;
    if (resultLanguage) resultLanguage.textContent = info.language;

    // Animate total value
    animateValue(totalValue, 0, displayTotal, 800);

    // Display normalized text
    if (normalizedText) {
        normalizedText.textContent = result.Normalized || 'Boş';
        normalizedText.style.direction = info.direction;
    }

    // Show variations for Arabic
    var variationsContainer = document.getElementById('variationsContainer');
    if (variationsContainer) {
        if (result.Variations && currentAlphabet === 'Arabic') {
            variationsContainer.style.display = 'block';

            // Update variation values
            if (document.getElementById('smallEbced'))
                document.getElementById('smallEbced').textContent = result.Variations.SmallEbced.toLocaleString('tr-TR');
            if (document.getElementById('bigEbced'))
                document.getElementById('bigEbced').textContent = result.Variations.BigEbced.toLocaleString('tr-TR');
            if (document.getElementById('smallestEbced'))
                document.getElementById('smallestEbced').textContent = result.Variations.SmallestEbced.toLocaleString('tr-TR');
            if (document.getElementById('biggestEbced'))
                document.getElementById('biggestEbced').textContent = result.Variations.BiggestEbced.toLocaleString('tr-TR');
            if (document.getElementById('shamsiCount'))
                document.getElementById('shamsiCount').textContent = result.Variations.ShamsiCount.toLocaleString('tr-TR');
            if (document.getElementById('qamariCount'))
                document.getElementById('qamariCount').textContent = result.Variations.QamariCount.toLocaleString('tr-TR');
        } else {
            variationsContainer.style.display = 'none';
        }
    }

    // Build letter grid
    buildLetterGrid(displayRows, info.direction);

    // Build summary table
    if (summaryBody && displayRows) {
        summaryBody.innerHTML = '';

        var charMap = {};
        for (var i = 0; i < displayRows.length; i++) {
            var row = displayRows[i];
            if (!charMap[row.Char]) {
                charMap[row.Char] = { value: row.Value, count: 0 };
            }
            charMap[row.Char].count++;
        }

        var charArray = [];
        for (var char in charMap) {
            if (charMap.hasOwnProperty(char)) {
                charArray.push({
                    char: char,
                    value: charMap[char].value,
                    count: charMap[char].count,
                    total: charMap[char].value * charMap[char].count
                });
            }
        }

        charArray.sort(function (a, b) {
            return b.total - a.total;
        });

        for (var j = 0; j < charArray.length; j++) {
            var item = charArray[j];
            var tr = document.createElement('tr');

            var td1 = document.createElement('td');
            td1.className = 'char-cell';
            td1.textContent = item.char;

            var td2 = document.createElement('td');
            td2.textContent = item.value.toLocaleString('tr-TR');

            var td3 = document.createElement('td');
            td3.className = 'count-cell';
            td3.textContent = item.count.toLocaleString('tr-TR');

            var td4 = document.createElement('td');
            td4.className = 'total-cell';
            td4.textContent = item.total.toLocaleString('tr-TR');

            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            tr.appendChild(td4);

            summaryBody.appendChild(tr);
        }
    }

    // Build detail table
    if (breakdownBody && displayRows) {
        breakdownBody.innerHTML = '';

        for (var k = 0; k < displayRows.length; k++) {
            var detailRow = displayRows[k];
            var detailTr = document.createElement('tr');

            var detailTd1 = document.createElement('td');
            detailTd1.textContent = (k + 1).toLocaleString('tr-TR');

            var detailTd2 = document.createElement('td');
            detailTd2.className = 'char-cell';
            detailTd2.textContent = detailRow.Char;

            var detailTd3 = document.createElement('td');
            detailTd3.className = 'value-cell';
            detailTd3.textContent = detailRow.Value.toLocaleString('tr-TR');

            detailTr.appendChild(detailTd1);
            detailTr.appendChild(detailTd2);
            detailTr.appendChild(detailTd3);

            breakdownBody.appendChild(detailTr);
        }
    }

    showResults();
}

// Build visual letter grid
function buildLetterGrid(rows, direction) {
    var letterGrid = document.getElementById('letterGrid');
    if (!letterGrid) return;

    letterGrid.innerHTML = '';
    letterGrid.style.direction = direction;

    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];

        var box = document.createElement('div');
        box.className = 'letter-box';
        box.style.animationDelay = (i * 0.03) + 's';

        var number = document.createElement('div');
        number.className = 'letter-box-number';
        number.textContent = (i + 1).toString();

        var char = document.createElement('div');
        char.className = 'letter-box-char';
        char.textContent = row.Char;

        var value = document.createElement('div');
        value.className = 'letter-box-value';
        value.textContent = row.Value.toLocaleString('tr-TR');

        box.appendChild(number);
        box.appendChild(char);
        box.appendChild(value);

        letterGrid.appendChild(box);
    }
}

// Animate number counting
function animateValue(element, start, end, duration) {
    if (!element) return;

    var startTime = performance.now();
    var difference = end - start;

    function update(currentTime) {
        var elapsed = currentTime - startTime;
        var progress = Math.min(elapsed / duration, 1);
        var easeOut = 1 - Math.pow(1 - progress, 3);
        var current = Math.floor(start + difference * easeOut);

        element.textContent = current.toLocaleString('tr-TR');

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = end.toLocaleString('tr-TR');
        }
    }

    requestAnimationFrame(update);
}

// Clear all
function clearAll() {
    if (inputText) {
        inputText.value = '';
        inputText.focus();
    }

    if (charCount) {
        charCount.textContent = '0 harf';
        charCount.style.color = '#667eea';
    }

    hideResults();
    hideError();
}

// UI Helper Functions
function showError(message) {
    if (errorBox) {
        errorBox.textContent = message;
        errorBox.style.display = 'block';
    }
}

function hideError() {
    if (errorBox) {
        errorBox.style.display = 'none';
    }
}

function showLoading(show) {
    if (loading) {
        loading.style.display = show ? 'block' : 'none';
    }
}

function showResults() {
    if (resultSection) {
        resultSection.style.display = 'block';
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function hideResults() {
    if (resultSection) {
        resultSection.style.display = 'none';
    }
}

// Copy variations to clipboard
function copyVariations() {
    var originalText = inputText ? inputText.value.trim() : '';

    var smallEbced = document.getElementById('smallEbced') ? document.getElementById('smallEbced').textContent : '0';
    var bigEbced = document.getElementById('bigEbced') ? document.getElementById('bigEbced').textContent : '0';
    var smallestEbced = document.getElementById('smallestEbced') ? document.getElementById('smallestEbced').textContent : '0';
    var biggestEbced = document.getElementById('biggestEbced') ? document.getElementById('biggestEbced').textContent : '0';
    var shamsiCount = document.getElementById('shamsiCount') ? document.getElementById('shamsiCount').textContent : '0';
    var qamariCount = document.getElementById('qamariCount') ? document.getElementById('qamariCount').textContent : '0';

    // Build HTML content
    var html = '<html><body>';

    html += '<h2 style="color:#667eea;text-align:center;">Ebced Hesaplama Türleri</h2>';

    // Original text
    if (originalText) {
        html += '<div style="text-align:center;font-size:1.5em;font-weight:700;margin:15px 0;direction:rtl;">';
        html += escapeHtml(originalText);
        html += '</div>';
    }

    html += '<hr style="margin:20px 0;border:1px solid #e2e8f0;">';

    // Variations table
    html += '<table style="border-collapse:collapse;width:100%;margin:20px 0;">';
    html += '<thead>';
    html += '<tr style="background:#667eea;color:white;">';
    html += '<th style="border:2px solid #000;padding:12px;text-align:center;">Hesaplama Türü</th>';
    html += '<th style="border:2px solid #000;padding:12px;text-align:center;">Değer</th>';
    html += '<th style="border:2px solid #000;padding:12px;text-align:center;">Açıklama</th>';
    html += '</tr>';
    html += '</thead>';
    html += '<tbody>';

    html += '<tr>';
    html += '<td style="border:2px solid #000;padding:10px;font-weight:600;">Küçük Ebced</td>';
    html += '<td style="border:2px solid #000;padding:10px;text-align:center;font-size:1.2em;font-weight:700;color:#667eea;">' + smallEbced + '</td>';
    html += '<td style="border:2px solid #000;padding:10px;">Normal hesaplama</td>';
    html += '</tr>';

    html += '<tr>';
    html += '<td style="border:2px solid #000;padding:10px;font-weight:600;">Büyük Ebced</td>';
    html += '<td style="border:2px solid #000;padding:10px;text-align:center;font-size:1.2em;font-weight:700;color:#667eea;">' + bigEbced + '</td>';
    html += '<td style="border:2px solid #000;padding:10px;">+ ال (Elif-Lam)</td>';
    html += '</tr>';

    html += '<tr>';
    html += '<td style="border:2px solid #000;padding:10px;font-weight:600;">En Küçük Ebced</td>';
    html += '<td style="border:2px solid #000;padding:10px;text-align:center;font-size:1.2em;font-weight:700;color:#667eea;">' + smallestEbced + '</td>';
    html += '<td style="border:2px solid #000;padding:10px;">Tekrarsız harfler</td>';
    html += '</tr>';

    html += '<tr>';
    html += '<td style="border:2px solid #000;padding:10px;font-weight:600;">En Büyük Ebced</td>';
    html += '<td style="border:2px solid #000;padding:10px;text-align:center;font-size:1.2em;font-weight:700;color:#667eea;">' + biggestEbced + '</td>';
    html += '<td style="border:2px solid #000;padding:10px;">Maksimum değer</td>';
    html += '</tr>';

    html += '</tbody>';
    html += '</table>';

    html += '<hr style="margin:20px 0;border:1px solid #e2e8f0;">';

    // Shamsi & Qamari
    html += '<h3 style="color:#667eea;text-align:center;">Şemsi ve Kameri Harfler</h3>';
    html += '<table style="border-collapse:collapse;width:100%;margin:20px 0;">';
    html += '<thead>';
    html += '<tr style="background:#667eea;color:white;">';
    html += '<th style="border:2px solid #000;padding:12px;text-align:center;width:50%;">☀️ Şemsi Harfler</th>';
    html += '<th style="border:2px solid #000;padding:12px;text-align:center;width:50%;">🌙 Kameri Harfler</th>';
    html += '</tr>';
    html += '</thead>';
    html += '<tbody>';
    html += '<tr>';
    html += '<td style="border:2px solid #000;padding:15px;text-align:center;background:#fef3c7;">';
    html += '<div style="font-size:2em;font-weight:700;color:#d97706;margin-bottom:10px;">' + shamsiCount + ' adet</div>';
    html += '<div style="direction:rtl;color:#92400e;">ت، ث، د، ذ، ر، ز، س، ش، ص، ض، ط، ظ، ل، ن</div>';
    html += '</td>';
    html += '<td style="border:2px solid #000;padding:15px;text-align:center;background:#dbeafe;">';
    html += '<div style="font-size:2em;font-weight:700;color:#2563eb;margin-bottom:10px;">' + qamariCount + ' adet</div>';
    html += '<div style="direction:rtl;color:#1e3a8a;">ا، ب، ج، ح، خ، ع، غ، ف، ق، ك، م، ه، و، ي</div>';
    html += '</td>';
    html += '</tr>';
    html += '</tbody>';
    html += '</table>';

    html += '</body></html>';

    // Copy
    copyHtmlToClipboard(html);

    // Visual feedback
    var btn = document.querySelector('.variations-header .copy-btn');
    if (btn) {
        var originalText = btn.innerHTML;
        btn.innerHTML = '✅ Kopyalandı!';
        btn.classList.add('copied');

        setTimeout(function () {
            btn.innerHTML = originalText;
            btn.classList.remove('copied');
        }, 2000);
    }
}

function getCalculationTypeId(type) {
    switch (type) {
        case 'Normal':
        case 'Shamsi':
        case 'Qamari':
            return 0; // All map to Normal backend calculation
        case 'Smallest': return 1;
        case 'Big': return 2;
        case 'Biggest': return 3;
        default: return 0;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    console.log('Page loaded, initializing...');

    if (inputText) {
        inputText.focus();
        // Set initial direction
        var info = alphabetInfo[currentAlphabet];
        inputText.style.direction = info.direction;
        inputText.style.textAlign = info.direction === 'rtl' ? 'right' : 'left';
    }

    initKeyboard();
});

// Copy single table to clipboard
function copyTable(tableId) {
    var table = document.getElementById(tableId);
    if (!table) return;

    // Create a range and select the table
    var range = document.createRange();
    range.selectNode(table);

    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    try {
        // Copy to clipboard
        document.execCommand('copy');

        // Visual feedback
        var btn = table.closest('.table-container').querySelector('.copy-btn');
        if (btn) {
            var originalText = btn.innerHTML;
            btn.innerHTML = '✅ Kopyalandı!';
            btn.classList.add('copied');

            setTimeout(function () {
                btn.innerHTML = originalText;
                btn.classList.remove('copied');
            }, 2000);
        }

        console.log('Table copied:', tableId);
    } catch (err) {
        console.error('Copy failed:', err);
        showError('Kopyalama başarısız oldu');
    }

    selection.removeAllRanges();
}

// Copy letter grid to clipboard
function copyLetterGrid() {
    var info = alphabetInfo[currentAlphabet];
    var originalText = inputText ? inputText.value.trim() : '';
    var letterGrid = document.getElementById('letterGrid');
    var total = totalValue ? totalValue.textContent : '0';

    if (!letterGrid) return;

    // Build HTML content
    var html = '<html><body>';

    // Original text at the top (centered, large)
    if (originalText) {
        html += '<div style="text-align:center;font-size:1.8em;font-weight:700;margin:20px 0;direction:' + info.direction + ';">';
        html += escapeHtml(originalText);
        html += '</div>';
    }

    // Letter grid as table
    html += '<table style="border-collapse:collapse;width:100%;margin:20px 0;">';

    var boxes = letterGrid.querySelectorAll('.letter-box');
    var cols = 10; // FIXED: 10 columns per row

    for (var i = 0; i < boxes.length; i++) {
        if (i % cols === 0) {
            if (i > 0) html += '</tr>';
            html += '<tr>';
        }

        var number = boxes[i].querySelector('.letter-box-number').textContent;
        var char = boxes[i].querySelector('.letter-box-char').textContent;
        var value = boxes[i].querySelector('.letter-box-value').textContent;

        html += '<td style="border:2px solid #000;padding:10px;text-align:center;width:80px;">';
        html += '<div style="background:#667eea;color:white;font-size:0.8em;font-weight:600;padding:2px 8px;border-radius:10px;margin-bottom:5px;">' + number + '</div>';
        html += '<div style="font-size:1.8em;font-weight:700;margin:5px 0;">' + char + '</div>';
        html += '<div style="font-size:1em;font-weight:700;color:#764ba2;">' + value + '</div>';
        html += '</td>';
    }

    html += '</tr>';
    html += '</table>';

    // Total below table (centered)
    html += '<div style="text-align:center;font-size:1.5em;font-weight:700;margin:20px 0;">';
    html += 'TOPLAM: ' + total;
    html += '</div>';

    html += '</body></html>';

    // Copy
    copyHtmlToClipboard(html);

    // Visual feedback
    var btn = document.querySelector('.grid-header .copy-btn');
    if (btn) {
        var originalText = btn.innerHTML;
        btn.innerHTML = '✅ Kopyalandı!';
        btn.classList.add('copied');

        setTimeout(function () {
            btn.innerHTML = originalText;
            btn.classList.remove('copied');
        }, 2000);
    }
}

// Copy all results for Word
function copyAllResults() {
    var info = alphabetInfo[currentAlphabet];
    var total = totalValue ? totalValue.textContent : '0';
    var normalized = normalizedText ? normalizedText.textContent : '';
    var originalText = inputText ? inputText.value.trim() : '';

    // Build HTML content for Word
    var html = '<html><body>';

    // Title
    html += '<h2 style="color:#667eea;">' + info.system + ' Hesaplama Sonucu (' + info.language + ')</h2>';

    // Original text
    if (originalText) {
        html += '<div style="background:#f8fafc;padding:15px;border-radius:8px;margin:10px 0;">';
        html += '<p style="margin:0;"><strong>Girilen Metin:</strong></p>';
        html += '<p style="margin:5px 0;font-size:1.2em;direction:' + info.direction + ';">' + escapeHtml(originalText) + '</p>';
        html += '</div>';
    }

    // Normalized text
    if (normalized && normalized !== originalText) {
        html += '<p><strong>Normalize Edilmiş Metin:</strong> <span style="font-size:1.1em;">' + normalized + '</span></p>';
    }

    // Total
    html += '<p style="font-size:1.2em;"><strong>Toplam Değer:</strong> <span style="color:#667eea;font-size:1.5em;font-weight:bold;">' + total + '</span></p>';

    html += '<hr style="margin:20px 0;border:1px solid #e2e8f0;">';

    // Letter grid
    var letterGrid = document.getElementById('letterGrid');
    if (letterGrid) {
        html += '<h3 style="color:#667eea;">🔤 Harf Analizi</h3>';
        html += '<p style="font-size:0.9em;color:#64748b;font-style:italic;">Her harfin sırasıyla değerleri</p>';

        html += '<table style="border-collapse:collapse;width:100%;margin:20px 0;">';
        var boxes = letterGrid.querySelectorAll('.letter-box');
        var cols = 10; // FIXED: 10 columns per row

        for (var i = 0; i < boxes.length; i++) {
            if (i % cols === 0) {
                if (i > 0) html += '</tr>';
                html += '<tr>';
            }

            var number = boxes[i].querySelector('.letter-box-number').textContent;
            var char = boxes[i].querySelector('.letter-box-char').textContent;
            var value = boxes[i].querySelector('.letter-box-value').textContent;

            html += '<td style="border:2px solid #000;padding:10px;text-align:center;width:80px;">';
            html += '<div style="background:#667eea;color:white;font-size:0.8em;font-weight:600;padding:2px 8px;border-radius:10px;margin-bottom:5px;">' + number + '</div>';
            html += '<div style="font-size:1.8em;font-weight:700;margin:5px 0;">' + char + '</div>';
            html += '<div style="font-size:1em;font-weight:700;color:#764ba2;">' + value + '</div>';
            html += '</td>';
        }

        html += '</tr>';
        html += '</table>';
    }

    html += '<br>';

    // Summary table
    var summaryTable = document.getElementById('summaryTable');
    if (summaryTable) {
        html += '<h3 style="color:#667eea;">📊 Harf Özeti</h3>';
        html += '<p style="font-size:0.9em;color:#64748b;font-style:italic;">Her harfin kaç kez tekrarlandığını ve toplam değere katkısını gösterir.</p>';
        html += getCleanTableHtml(summaryTable);
    }

    html += '<br>';

    // Detail table
    var detailTable = document.getElementById('detailTable');
    if (detailTable) {
        html += '<h3 style="color:#667eea;">📝 Harf Detayı</h3>';
        html += '<p style="font-size:0.9em;color:#64748b;font-style:italic;">Metindeki harflerin sırasıyla listesi ve her birinin değeri.</p>';
        html += getCleanTableHtml(detailTable);
    }

    html += '</body></html>';

    // Copy as HTML (works better with Word)
    copyHtmlToClipboard(html);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Get clean table HTML without description row
function getCleanTableHtml(table) {
    var clone = table.cloneNode(true);

    // Remove description row
    var descRow = clone.querySelector('.table-desc-row');
    if (descRow) descRow.remove();

    // Add border styling for Word
    clone.style.borderCollapse = 'collapse';
    clone.style.width = '100%';

    var cells = clone.querySelectorAll('th, td');
    cells.forEach(function (cell) {
        cell.style.border = '1px solid #ccc';
        cell.style.padding = '8px';
        cell.style.textAlign = 'center';
    });

    var headers = clone.querySelectorAll('th');
    headers.forEach(function (th) {
        th.style.backgroundColor = '#667eea';
        th.style.color = 'white';
    });

    return clone.outerHTML;
}

// Copy HTML to clipboard
function copyHtmlToClipboard(html) {
    // Create a temporary container
    var container = document.createElement('div');
    container.innerHTML = html;
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    // Select and copy
    var range = document.createRange();
    range.selectNode(container);

    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    try {
        document.execCommand('copy');

        // Visual feedback
        var btn = document.querySelector('.btn-copy-all');
        if (btn) {
            var originalText = btn.innerHTML;
            btn.innerHTML = '✅ Tüm Sonuçlar Kopyalandı!';
            btn.classList.add('copied');

            setTimeout(function () {
                btn.innerHTML = originalText;
                btn.classList.remove('copied');
            }, 2000);
        }

        console.log('All results copied');
    } catch (err) {
        console.error('Copy failed:', err);
        showError('Kopyalama başarısız oldu');
    }

    selection.removeAllRanges();
    document.body.removeChild(container);
}