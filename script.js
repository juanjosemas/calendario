// =================================================================
// 1. OBTENCIÓN DE ELEMENTOS DEL DOM Y VARIABLES GLOBALES
// =================================================================
const mainContent = document.querySelector('main');
const headerElement = document.querySelector('.cabecera');
const calendarElement = document.getElementById('calendario');
const appointmentForm = document.getElementById('appointment-form');
const backToCalendarBtn = document.getElementById('boton-atras-form');
const saveEventBtn = document.getElementById('boton-guardar-form');
const addEventFabButton = document.getElementById('boton-flotante');
const eventListElement = document.getElementById('event-list');
const eventNameInput = document.getElementById('ingresar-evento');
const eventTimeInput = document.getElementById('boton-hora');
const formTitle = document.getElementById('form-title');
const selectedDateElement = document.getElementById('selected-date');
const timeElement = document.querySelector('.tiempo');

let events = localStorage.getItem('events') ? JSON.parse(localStorage.getItem('events')) : {};
let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth();
let editingEvent = null;
let diaSeleccionado = null;


// =================================================================
// 2. LÓGICA DE EVENTOS (AÑADIR, MOSTRAR, EDITAR, BORRAR)
// =================================================================

function addOrUpdateEvent(day, eventName, eventTime) {
  const key = day.toISOString().split('T')[0];
  if (!events[key]) {
    events[key] = [];
  }
  if (editingEvent) {
    const index = events[key].findIndex(e => e === editingEvent.event);
    if (index !== -1) {
      events[key][index] = { name: eventName, time: eventTime };
    }
  } else {
    events[key].push({ name: eventName, time: eventTime });
  }
  localStorage.setItem('events', JSON.stringify(events));
  editingEvent = null;
}

// Muestra eventos para un DÍA específico.
function showEventsForSelectedDay(selectedDay) {
  diaSeleccionado = selectedDay;
  eventListElement.innerHTML = ''; 
  
  const title = document.createElement('h3');
  title.textContent = `Eventos para el ${selectedDay.getDate()}/${selectedDay.getMonth() + 1}`;
  title.style.textAlign = 'center';
  eventListElement.appendChild(title);
  
  const key = selectedDay.toISOString().split('T')[0];
  if (events[key] && events[key].length > 0) {
    events[key].sort((a, b) => a.time.localeCompare(b.time));
    events[key].forEach(event => {
      createEventElement(selectedDay, event);
    });
  } else {
      const noEventsMessage = document.createElement('p');
      noEventsMessage.textContent = 'No hay eventos para este día.';
      noEventsMessage.style.textAlign = 'center';
      eventListElement.appendChild(noEventsMessage);
  }
  selectedDateElement.textContent = selectedDay.toLocaleDateString('es', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// MODIFICADO: Muestra TODOS los eventos del mes actual, sin título ni mensaje de "no hay eventos".
function showEventsForCurrentMonth(year, month) {
    eventListElement.innerHTML = ''; // Limpia la lista

    let monthEvents = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
        const dayDate = new Date(year, month, i);
        const key = dayDate.toISOString().split('T')[0];
        if (events[key]) {
            events[key].forEach(event => {
                monthEvents.push({ date: dayDate, event: event });
            });
        }
    }

    if (monthEvents.length > 0) {
        monthEvents.sort((a, b) => a.date - b.date || a.event.time.localeCompare(b.event.time));
        monthEvents.forEach(item => {
            createEventElement(item.date, item.event, true); // true para vista de mes
        });
    }
    // Si no hay eventos, la lista simplemente se queda vacía.
}


// Crea el elemento de evento (reutilizable).
function createEventElement(date, event, isMonthView = false) {
    const eventItem = document.createElement('div');
    eventItem.classList.add('event');
    const eventInfo = document.createElement('span');
    
    eventInfo.textContent = isMonthView 
        ? `Día ${date.getDate()}: ${event.name} - ${event.time}` 
        : `${event.name} - ${event.time}`;
    
    eventItem.appendChild(eventInfo);

    const buttonsContainer = document.createElement('div');
    const editButton = document.createElement('button');
    editButton.textContent = 'Editar';
    editButton.classList.add('boton-accion', 'boton-editar');
    editButton.addEventListener('click', () => {
        setupEditEvent(date, event);
    });
    buttonsContainer.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Borrar';
    deleteButton.classList.add('boton-accion', 'boton-borrar');
    deleteButton.addEventListener('click', () => {
        if (confirm('¿Estás seguro que quieres borrar este evento?')) {
            deleteEvent(date, event);
        }
    });
    buttonsContainer.appendChild(deleteButton);

    eventItem.appendChild(buttonsContainer);
    eventListElement.appendChild(eventItem);
}

function setupEditEvent(day, event) {
  diaSeleccionado = day;
  editingEvent = { day, event };
  formTitle.textContent = '"Editar Evento"';
  saveEventBtn.textContent = 'Actualizar';
  eventNameInput.value = event.name;
  eventTimeInput.value = event.time;
  showView('form');
}

function deleteEvent(day, eventToDelete) {
  const key = day.toISOString().split('T')[0];
  if (events[key]) {
    events[key] = events[key].filter(event => event !== eventToDelete);
    if (events[key].length === 0) {
      delete events[key];
    }
    localStorage.setItem('events', JSON.stringify(events));
    updateCalendar(currentYear, currentMonth);
  }
}

// =================================================================
// 3. LÓGICA DEL CALENDARIO Y VISTAS
// =================================================================

function updateCalendar(year, month) {
  calendarElement.innerHTML = '';
  diaSeleccionado = null; 
  document.querySelectorAll('.selected-day').forEach(d => d.classList.remove('selected-day'));

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const monthHeaderContainer = document.createElement('div');
  monthHeaderContainer.classList.add('nombre-mes-container');

  const prevMonthButton = document.createElement('button');
  prevMonthButton.textContent = '◀';
  prevMonthButton.classList.add('mes-anterior');
  prevMonthButton.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    updateCalendar(currentYear, currentMonth);
  });
  monthHeaderContainer.appendChild(prevMonthButton);

  const monthTitle = document.createElement('span');
  monthTitle.classList.add('nombre-mes');
  monthTitle.textContent = `${monthNames[month]} ${year}`;
  monthHeaderContainer.appendChild(monthTitle);

  const nextMonthButton = document.createElement('button');
  nextMonthButton.textContent = '▶';
  nextMonthButton.classList.add('mes-siguiente');
  nextMonthButton.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    updateCalendar(currentYear, currentMonth);
  });
  monthHeaderContainer.appendChild(nextMonthButton);

  calendarElement.appendChild(monthHeaderContainer);

  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const dayNamesRow = document.createElement('div');
  dayNamesRow.classList.add('day-names');
  dayNames.forEach(dayName => {
    const dayNameElement = document.createElement('div');
    dayNameElement.classList.add('day-name');
    dayNameElement.textContent = dayName;
    dayNamesRow.appendChild(dayNameElement);
  });
  calendarElement.appendChild(dayNamesRow);

  const daysGrid = document.createElement('div');
  daysGrid.classList.add('days-grid');
  const firstDayOfMonth = new Date(year, month, 1);
  let startingDay = firstDayOfMonth.getDay() - 1;
  if (startingDay === -1) startingDay = 6;

  for (let i = 0; i < startingDay; i++) {
    const emptyDayElement = document.createElement('div');
    emptyDayElement.classList.add('day', 'empty-day');
    daysGrid.appendChild(emptyDayElement);
  }

  const lastDayOfMonth = new Date(year, month + 1, 0);
  const today = new Date();
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const dayElement = document.createElement('div');
    dayElement.classList.add('day');
    dayElement.textContent = i;
    const dayDate = new Date(year, month, i);
    const key = dayDate.toISOString().split('T')[0];
    if (events[key] && events[key].length > 0) {
      dayElement.classList.add('event-day');
    }
    if (today.getDate() === i && month === today.getMonth() && year === today.getFullYear()) {
      dayElement.classList.add('current-day');
    } else {
      dayElement.classList.add('selectable-day');
    }
    dayElement.addEventListener('click', () => {
      document.querySelectorAll('.selected-day').forEach(d => d.classList.remove('selected-day'));
      dayElement.classList.add('selected-day');
      showEventsForSelectedDay(dayDate); 
    });
    daysGrid.appendChild(dayElement);
  }
  calendarElement.appendChild(daysGrid);

  showEventsForCurrentMonth(year, month);
}

function showView(viewName) {
  const isFormView = viewName === 'form';
  headerElement.classList.toggle('hidden', isFormView);
  mainContent.classList.toggle('hidden', isFormView);
  appointmentForm.classList.toggle('hidden', !isFormView);
  addEventFabButton.classList.toggle('hidden', isFormView);
}

function resetForm() {
  eventNameInput.value = '';
  eventTimeInput.value = '';
  formTitle.textContent = '"Agregar Evento"';
  saveEventBtn.textContent = 'Guardar';
  editingEvent = null;
}

// =================================================================
// 4. MANEJADORES DE EVENTOS Y INICIALIZACIÓN
// =================================================================

addEventFabButton.addEventListener('click', () => {
  if (!diaSeleccionado) {
    alert('Por favor, selecciona un día en el calendario antes de añadir un evento.');
    return;
  }
  resetForm();
  showView('form');
});

backToCalendarBtn.addEventListener('click', () => {
  resetForm();
  showView('calendar');
});

saveEventBtn.addEventListener('click', () => {
  const appointmentName = eventNameInput.value.trim();
  const appointmentTime = eventTimeInput.value;
  if (!appointmentName || !appointmentTime) {
    alert('Por favor, completa el nombre y la hora del evento.');
    return;
  }
  
  const day = editingEvent ? editingEvent.day : diaSeleccionado;
  
  addOrUpdateEvent(day, appointmentName, appointmentTime);
  updateCalendar(currentYear, currentMonth); 
  resetForm();
  showView('calendar');
});

eventNameInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); 
        saveEventBtn.click();
    }
});


// =================================================================
// 5. NOTIFICACIONES Y RELOJ
// =================================================================
function sendNotification(event) {
  if (Notification.permission === 'granted') {
    new Notification('Recordatorio de Evento', {
      body: `El evento "${event.name}" comienza ahora a las ${event.time}.`,
      icon: 'img/Juanjo.ico'
    });
  }
}

function Relojdigital() {
  const f = new Date();
  timeElement.innerHTML = f.toLocaleTimeString('es');
  if (f.getSeconds() === 0) {
    const currentDateString = f.toISOString().split('T')[0];
    const currentHour = f.getHours();
    const currentMinute = f.getMinutes();
    if (events[currentDateString]) {
      events[currentDateString].forEach(event => {
        if (event.time) {
          const [eventHour, eventMinute] = event.time.split(':').map(Number);
          if (eventHour === currentHour && eventMinute === currentMinute) {
            sendNotification(event);
          }
        }
      });
    }
  }
}

// =================================================================
// 6. INICIO DE LA APLICACIÓN
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
  if ('Notification' in window) {
    Notification.requestPermission();
  }
  updateCalendar(currentYear, currentMonth);
  setInterval(Relojdigital, 1000); 
  Relojdigital();
});