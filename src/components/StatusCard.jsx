import Card from 'react-bootstrap/Card'

// Cartão genérico de indicador: recebe ícone, título, valor e descrição por props.
function StatusCard({ iconClass, icon, title, value, description }) {
  return (
    <Card className="status-card">
      <Card.Body>
        <div className={`card-icon ${iconClass}`}>{icon}</div>
        <Card.Title className="fs-6 text-muted mb-1">{title}</Card.Title>
        <div className="fs-3 fw-bold mb-1">{value}</div>
        <Card.Text className="small text-muted mb-0">{description}</Card.Text>
      </Card.Body>
    </Card>
  )
}

// Exporta o componente para compor os indicadores das páginas.
export default StatusCard