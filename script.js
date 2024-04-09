// Obtener el elemento del calendario
const calendarElement = document.getElementById('calendario');
// Obtener el elemento del formulario de cita
const appointmentForm = document.getElementById('appointment-form');
// Obtener el botón de volver al calendario
const backToCalendarBtn = document.getElementById('boton-atras-form');

// Objeto para almacenar los eventos
let events = localStorage.getItem('events') ? JSON.parse(localStorage.getItem('events')) : {};

// Función para añadir un evento a un día específico
function addEventToDay(day, eventName, eventTime) {
  const key = day.toISOString().split('T')[0];
  if (!events[key]) {
    events[key] = [];
  }
  events[key].push({ name: eventName, time: eventTime });
  localStorage.setItem('events', JSON.stringify(events)); // Guardar eventos en localStorage
}

// Función para mostrar los eventos del día seleccionado
function showEventsForSelectedDay(selectedDay) {
  const key = selectedDay.toISOString().split('T')[0];
  const eventListElement = document.getElementById('event-list');
  eventListElement.innerHTML = ''; // Limpiar la lista de eventos antes de actualizar
  if (events[key]) {
    events[key].forEach(event => {
      const eventItem = document.createElement('div');
      eventItem.classList.add('event');

      // Mostrar el nombre y la hora del evento
      const eventInfo = document.createElement('span');
      eventInfo.textContent = `${event.name} - ${event.time}`;
      eventItem.appendChild(eventInfo);

      // Agregar un botón de "Borrar" para eliminar el evento
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Borrar';
      deleteButton.classList.add('boton-borrar');
      deleteButton.addEventListener('click', () => {
        deleteEvent(selectedDay, event);
      });
      eventItem.appendChild(deleteButton);

      eventListElement.appendChild(eventItem);
    });
  }
  // Actualizar el texto debajo del calendario solo cuando se seleccione un día
  const selectedDateElement = document.getElementById('selected-date');
  selectedDateElement.textContent = selectedDay.toLocaleDateString('es', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// Función para eliminar un evento seleccionado
function deleteEvent(day, eventToDelete) {
  const key = day.toISOString().split('T')[0];
  if (events[key]) {
    events[key] = events[key].filter(event => event !== eventToDelete);
    localStorage.setItem('events', JSON.stringify(events)); // Actualizar eventos en localStorage
    // Mostrar los eventos actualizados después de eliminar el evento
    showEventsForSelectedDay(day);
    // Actualizar el calendario para reflejar el cambio en los eventos
    const currentDate = new Date(); // Obtener la fecha actual
    updateCalendar(currentDate.getFullYear(), currentDate.getMonth()); // Actualizar el calendario con la fecha actual
  }
}
    
// Crear el calendario
function createCalendar() {
  const currentDate = new Date();
  let currentYear = currentDate.getFullYear();
  let currentMonth = currentDate.getMonth();

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  // Función para actualizar el calendario con el mes y año especificados
  function updateCalendar(year, month) {
    calendarElement.innerHTML = ''; // Limpiar el calendario antes de actualizar

    // Crear la cabecera del mes
    const monthHeader = document.createElement('div');
    monthHeader.classList.add('nombre-mes');
    monthHeader.textContent = `${monthNames[month]} ${year}`;

    // Crear el botón de "Atrás"
    const prevMonthButton = document.createElement('button');
    prevMonthButton.textContent ='<';
    prevMonthButton.classList.add('mes-anterior');
    monthHeader.appendChild(prevMonthButton);
    // Evento de clic para ir al mes anterior
    prevMonthButton.addEventListener('click', () => {
      if (month === 0) {
        currentYear--;
        currentMonth = 11;
      } else {
        currentMonth--;
      }
      updateCalendar(currentYear, currentMonth);
    });

    // Crear el botón de "Siguiente"
    const nextMonthButton = document.createElement('button');
    nextMonthButton.textContent = '>';
    nextMonthButton.classList.add('mes-siguiente');
    monthHeader.appendChild(nextMonthButton);
    // Evento de clic para ir al mes siguiente
    nextMonthButton.addEventListener('click', () => {
      if (month === 11) {
        currentYear++;
        currentMonth = 0;
      } else {
        currentMonth++;
      }
      updateCalendar(currentYear, currentMonth);
    });

    // Añadir la cabecera al calendario
    calendarElement.appendChild(monthHeader);

    // Crear los nombres de los días de la semana
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

    // Crear los días del mes
    const daysGrid = document.createElement('div');
    daysGrid.classList.add('days-grid');

    // Obtener el primer día del mes y ajustar para que sea lunes
    const firstDayOfMonth = new Date(year, month, 1);
    let startingDay = firstDayOfMonth.getDay() - 1; // Restar 1 para que el lunes sea el primer día (lunes=1, domingo=0)
    if (startingDay === -1) startingDay = 6; // Si es domingo, cambiarlo a 6

    // Crear espacios en blanco para los días anteriores si el mes no comienza en lunes
    for (let i = 0; i < startingDay; i++) {
      const emptyDayElement = document.createElement('div');
      emptyDayElement.classList.add('day');
      emptyDayElement.classList.add('empty-day');
      daysGrid.appendChild(emptyDayElement);
    }

    // Crear los días del mes
    const lastDayOfMonth = new Date(year, month + 1, 0);
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const dayElement = document.createElement('div');
      dayElement.classList.add('day');
      dayElement.textContent = i;

      const key = new Date(year, month, i).toISOString().split('T')[0];
      if (events[key] && events[key].length > 0) {
        dayElement.classList.add('event-day'); // Agregar clase 'event-day' si hay eventos en este día
      }

      // Agregar clase 'current-day' al día actual
      if (currentDate.getDate() === i && month === currentDate.getMonth() && year === currentDate.getFullYear()) {
        dayElement.classList.add('current-day');
      } else {
        dayElement.classList.add('selectable-day'); // Agregar clase a los días seleccionables
      }

      // Evento de clic para seleccionar el día
      dayElement.addEventListener('click', () => {
        // Remover la clase de los otros días seleccionados
        const selectedDays = document.querySelectorAll('.selected-day');
        selectedDays.forEach(selectedDay => {
          selectedDay.classList.remove('selected-day');
        });
        // Agregar la clase al día seleccionado
        dayElement.classList.add('selected-day');
        // Mostrar los eventos del día seleccionado
        showEventsForSelectedDay(new Date(year, month, parseInt(dayElement.textContent)));
      });
      daysGrid.appendChild(dayElement);
    }
    calendarElement.appendChild(daysGrid);
  }

  // Función para mostrar el formulario de cita
  function showAppointmentForm() {
    // Ocultar el calendario
    calendarElement.style.display = 'none';
    // Mostrar el formulario de cita
    appointmentForm.style.display = 'block';
  }

  // Obtener el botón flotante
  const addEventFabButton = document.getElementById('boton-flotante');

  // Evento de clic para ir a la pantalla de agregar evento
  addEventFabButton.addEventListener('click', () => {
    showAppointmentForm();
  });

  // Función para volver al calendario desde el formulario de cita
  backToCalendarBtn.addEventListener('click', () => {
    // Mostrar el calendario
    calendarElement.style.display = 'block';
    // Ocultar el formulario de cita
    appointmentForm.style.display = 'none';
  });

  // Evento de clic para guardar la cita
  document.getElementById('boton-guardar-form').addEventListener('click', () => {
    const selectedDayElement = document.querySelector('.selected-day');
    if (selectedDayElement) {
      const selectedDay = new Date(currentYear, currentMonth, parseInt(selectedDayElement.textContent));
      const appointmentName = document.getElementById('ingresar-evento').value;
      const appointmentTime = document.getElementById('boton-hora').value;
      addEventToDay(selectedDay, appointmentName, appointmentTime);
      // Mostrar los eventos del día seleccionado
      showEventsForSelectedDay(selectedDay);
    }
    // Limpiar los campos después de guardar el evento
    document.getElementById('ingresar-evento').value = ''; // Limpiar el campo de nombre de evento
    document.getElementById('boton-hora').value = ''; // Limpiar el campo de hora de evento
    // Ocultar el formulario de cita
    appointmentForm.style.display = 'none';
    // Mostrar el calendario
    calendarElement.style.display = 'block';
  });

  // Crear el calendario al cargar la página
  updateCalendar(currentYear, currentMonth);
}

// Crear el calendario
createCalendar();

// Función para actualizar el calendario con el mes y año especificados
function updateCalendar(year, month) {
  // Tu código para actualizar el calendario iría aquí
}
