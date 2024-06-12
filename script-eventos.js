document.addEventListener('DOMContentLoaded', function() {
    const events = JSON.parse(localStorage.getItem('events')) || [];

    const eventList = document.createElement('div');
    eventList.className = 'event-list';

    function renderEvents() {
        events.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'event';
            eventElement.textContent = `${event.date}: ${event.title}`;
            eventList.appendChild(eventElement);
        });
    }

    renderEvents();
    document.body.appendChild(eventList);
});