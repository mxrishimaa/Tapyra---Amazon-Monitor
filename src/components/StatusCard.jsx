import Card from 'react-bootstrap/Card'

function StatusCard({ title, value, variant = "primary", description }) {
  return (
    <Card bg={variant} text="white" className='mb-3 shadow-sm'>
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Text className="fs-2 fw-bold mb-0">{value}</Card.Text>
      </Card.Body>
    </Card>
  );
}

export default StatusCard