import { useState } from 'react'

function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <aside className="whatsapp-widget">
      {isOpen && (
        <div
          id="whatsapp-notice"
          className="whatsapp-notice"
          role="status"
          aria-live="polite"
        >
          <h2>Alertas pelo WhatsApp</h2>
          <p>
            Em breve você poderá receber notificações sobre fumaça e fogo por
            aqui. Este recurso ainda não está ativo.
          </p>
        </div>
      )}
      <button
        type="button"
        className="whatsapp-button"
        aria-label="Informações sobre notificações pelo WhatsApp"
        aria-expanded={isOpen}
        aria-controls="whatsapp-notice"
        onClick={() => setIsOpen((open) => !open)}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M20.2 11.7a8.2 8.2 0 0 1-12.1 7.2L4 20l1.1-3.9a8.2 8.2 0 1 1 15.1-4.4Z" />
          <path d="M9 8.4c.2-.5.5-.5.8-.5h.6c.2 0 .4.1.5.4l.9 2.1c.1.3.1.5-.1.7l-.7.8c-.2.2-.2.4-.1.6.3.5.8 1.2 1.6 1.8.8.6 1.4.9 1.8 1 .2.1.4 0 .5-.2l.7-.8c.2-.2.4-.3.7-.2l2 .9c.3.1.4.3.4.5 0 .3-.1.9-.4 1.3-.4.5-1.2.8-1.8.9-.5 0-1.1-.1-1.8-.4-1.1-.4-2.3-1.2-3.5-2.3-1.1-1-1.9-2.1-2.4-3.3-.3-.8-.4-1.4-.2-2 .2-.6.5-1 .8-1.3Z" />
        </svg>
      </button>
    </aside>
  )
}

export default WhatsAppWidget
