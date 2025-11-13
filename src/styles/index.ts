export const styles = {
    sliderHorizontal: {
        bottom: '1vh',
        width: '80%',
        maxWidth: '400px',
        zIndex: 10,
    },
    sliderVertical: {
        height: '300px',
        zIndex: 10,
    },
    webcamContainer: {
        display: 'flex',
        flexDirection: {
            xs: 'column',
            sm: 'row'
        },
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
    },
    webcam: {
        display: 'flex',
        flexDirection: {
            xs: 'column',
            sm: 'row'
        },
        height: '100%',
        width: '100%',
        alignItems: 'center',
        justifyContent: {
            xs: 'flex-start',
            sm: 'center'
        },
        padding: {
        },
        gap: {
            xs: 2,
            sm: 4
        },
        position: 'relative',
        overflow: 'hidden',
    },
    video: {
        borderRadius: '16px',
        border: '4px solid',
        borderColor: 'white',
        objectFit: 'cover',
        maxWidth: '100%',
        maxHeight: {
            xs: 'calc(100vh - 350px)',
            sm: 'calc(100vh - 100px)'
        },
        width: {
            xs: '60%',
            sm: 'auto'
        },
        height: {
            xs: 'auto',
            sm: '70vh'
        },
    },
    zoomInfo: {
        backgroundColor: {
            xs: 'rgba(255, 255, 255, 0.9)',
            sm: 'transparent'
        },
        padding: {
            xs: '8px 16px',
            sm: 0
        },
        borderRadius: {
            xs: '8px',
            sm: 0
        },
        zIndex: 10,
    },
    zoomInfoContainer: {
        display: 'flex',
        flexDirection: {
            xs: 'column',
            sm: 'column',
        },
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: {
            xs: '20%',
            sm: '100%',
        },
        gap: {
            xs: '1vh',
            sm: '20vh',
        }
    },
    shutter: {
        borderRadius: '50%',
        width: '80px',
        height: '80px',
        backgroundColor: 'rgba(246, 3, 3, 0.7)',
        borderColor: '#0f0000',
        borderWidth: '2px',
        borderStyle: 'solid',
    },
    shutterContainer: {
        height: {
            xs: '13vh',
            sm: '20vh',
        },
        width: {
            xs: '100vw',
            sm: '10em'
        },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        justifyItems: 'center',
        alignContent: 'center',
        flexDirection: {
            xs: 'column',
            sm: 'column',
        }
    },
}