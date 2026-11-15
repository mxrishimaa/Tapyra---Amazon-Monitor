// Lista das imagens que podem aparecer na tela inicial; cada item é um endereço.
export const SPLASH_IMAGES = [
    // 'https://images.pexels.com/photos/17862061/pexels-photo-17862061.jpeg',
    // 'https://images.pexels.com/photos/40437019/pexels-photo-40437019.jpeg',
    // 'https://images.pexels.com/photos/27038079/pexels-photo-27038079.jpeg',
    // 'https://images.pexels.com/photos/40437003/pexels-photo-40437003.jpeg',
    // 'https://images.pexels.com/photos/29759409/pexels-photo-29759409.jpeg',
    // 'https://images.pexels.com/photos/33025204/pexels-photo-33025204.jpeg',
    // 'https://images.pexels.com/photos/4044067/pexels-photo-4044067.jpeg',
    // 'https://images.pexels.com/photos/39824187/pexels-photo-39824187.jpeg',
    // 'https://images.pexels.com/photos/26108707/pexels-photo-26108707.jpeg',
    // 'https://images.pexels.com/photos/17025853/pexels-photo-17025853.jpeg'

    // Imagens da pasta public/splash - -- verificar tempo de carregamento
    "/public/splash/img1.jpg",
    "/public/splash/img2.jpg",
    "/public/splash/img3.jpg",
    "/public/splash/img4.jpg",
    "/public/splash/img5.jpg",
    "/public/splash/img6.jpg",
    "/public/splash/img7.jpg",
    "/public/splash/img8.jpg",
    "/public/splash/img9.jpg",
    "/public/splash/img10.jpg",
    "/public/splash/img11.jpg"

]

/**
 * Devolve uma cópia embaralhada da lista, sem alterar o array original.
 * Fisher–Yates troca cada posição por outra escolhida aleatoriamente.
 */
export function shuffleImages(list) {
    // O spread cria uma cópia para preservar os dados recebidos pelo chamador.
    const arr = [...list]
    // Percorre do fim para o começo, escolhendo uma posição aleatória ainda não fixada.
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const tmp = arr[i]
        arr[i] = arr[j]
        arr[j] = tmp
    }
    return arr
}