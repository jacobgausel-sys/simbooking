// 1. Konfigurasjon
const SUPABASE_URL = 'https://ohwehwwlubyyraycyvet.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9od2Vod3dsdWJ5eXJheWN5dmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MzIyODQsImV4cCI6MjA4NTAwODI4NH0.CYOgogwMURba1mIApBwsCucGk_yb0xPMvj_w3gyU6Tg';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
let currentDate = new Date();
let selectedTime = "";

async function fetchAndRender() {
    const dateKey = currentDate.toISOString().split('T')[0];
    const display = document.getElementById('currentDateDisplay');
    
    if (display) {
        display.innerText = currentDate.toLocaleDateString('no-NO', { 
            weekday: 'long', day: 'numeric', month: 'long' 
        });
    }

    const { data: bookings } = await _supabase.from('bookings').select('*').eq('date', dateKey);
    const container = document.getElementById('timeslots');
    if (!container) return;
    container.innerHTML = "";

    for (let i = 7; i <= 22; i++) {
        const timeLabel = `${i.toString().padStart(2, '0')}:00 - ${(i+1).toString().padStart(2, '0')}:00`;
        const booking = bookings?.find(b => b.time_slot === timeLabel);

        const div = document.createElement('div');
        div.className = "slot" + (booking ? " booked" : "");
        
        if (booking) {
            div.innerHTML = `<span>${timeLabel}</span><br><strong>${booking.user_name}</strong><br><button class="delete-btn" onclick="deleteBooking('${booking.id}', event)">Slett</button>`;
        } else {
            div.innerHTML = `<span>${timeLabel}</span><br><small>Ledig</small>`;
            div.onclick = () => openModal(timeLabel);
        }
        container.appendChild(div);
    }
}

function openModal(time) {
    selectedTime = time;
    document.getElementById('selectedSlotText').innerText = time;
    document.getElementById('bookingModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('bookingModal').style.display = 'none';
}

async function saveBooking() {
    const nameInput = document.getElementById('userName');
    const passwordInput = document.getElementById('userPassword'); // Henter passord-boksen
    const name = nameInput.value;
    const password = passwordInput.value; // Henter det du har skrevet

    if (!name) return alert("Skriv navn!");
    
    // Her bestemmer du passordet (f.eks. Marianne2026)
    if (password !== "Mariannesim2026") { 
        alert("Feil passord! Du må ha riktig passord for å booke.");
        return; // Stopper her hvis passordet er feil
    }

    await _supabase.from('bookings').insert([{
        date: currentDate.toISOString().split('T')[0],
        time_slot: selectedTime,
        user_name: name
    }]);

    closeModal();
    nameInput.value = "";
    passwordInput.value = ""; // Tømmer passordfeltet etterpå
    fetchAndRender();
}

   

async function deleteBooking(id, event) {
    event.stopPropagation();
    if (!confirm("Vil du slette denne bookingen?")) return;
    await _supabase.from('bookings').delete().eq('id', id);
    fetchAndRender();
}

function changeDate(days) {
    currentDate.setDate(currentDate.getDate() + days);
    fetchAndRender();
}

fetchAndRender();