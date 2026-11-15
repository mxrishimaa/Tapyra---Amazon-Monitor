import { Card, Badge } from 'react-bootstrap'

// Cartão reutilizável para apresentar uma notícia e seu link para a matéria.
function NewsCard({ title, source, date, summary, url }) {
    return (
        <Card className='mb-3 shadow-sm border-0'>
            <Card.Body>
                <div className='d-flex justify-content-between mb-2'>
                    <Badge bg='secondary'>{source}</Badge>
                    <small className='text-muted'>{date}</small>
                </div>
                <Card.Title className='fs-6'>{title}</Card.Title>
                <Card.Text className='small text-secondary'>{summary}</Card.Text>
                <a href={url} target='_blank' rel='noopener noreferrer' className='btn btn-sm btn-outline-primary'>Ler matéria completa</a>
            </Card.Body>
        </Card>
    )
}

// Exportação padrão para que páginas possam importar o cartão.
export default NewsCard