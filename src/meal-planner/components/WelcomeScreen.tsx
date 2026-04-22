interface Props {
  onStart: () => void
}

export default function WelcomeScreen({ onStart }: Props) {
  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      fontFamily: "'Nunito', 'Helvetica Neue', sans-serif",
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>

      <img
        src="./assets/home.png"
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center top',
          zIndex: 0,
        }}
      />

      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.12) 40%, rgba(0,0,0,0.65) 100%)',
        zIndex: 1,
      }} />

      <div style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1.5vh 4vw',
        height: '100vh',
        width: '100%',
        boxSizing: 'border-box',
        justifyContent: 'space-between',
      }}>

        {/* Logo rechtsboven */}
        <img
          src="./assets/logomealyntrans.png"
          alt="Mealyn"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            height: 'clamp(32px, 5vh, 56px)',
            zIndex: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.64)',
            padding: '4px 8px',
          }}
        />

        {/* Titel */}
        <h1 style={{
          color: 'white',
          fontSize: 'clamp(1.4rem, 3.5vw, 3rem)',
          fontWeight: 800,
          textAlign: 'center',
          lineHeight: 1.2,
          margin: '4vh 0 0',
          textShadow: '0 4px 16px rgba(0,0,0,0.3)',
          width: '100%',
          maxWidth: '900px',
          alignSelf: 'center',
        }}>
          Begin hier met boodschappen
        </h1>

        {/* Midden sectie */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 'clamp(16px, 4vw, 60px)',
          width: '100%',
          maxWidth: '1000px',
          alignSelf: 'center',
          flex: 1,
          padding: '1.5vh 0',
        }}>

          {/* Bonnetje */}
          <img
            src="./assets/bonnetje.png"
            alt="Boodschappenlijst voorbeeld"
            style={{
              width: 'clamp(140px, 25vw, 320px)',
              borderRadius: '8px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
              transform: 'rotate(-2deg)',
              flexShrink: 0,
            }}
          />

          {/* Feature lijst */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(6px, 1vh, 14px)',
            flex: 1,
          }}>
            {[
              'Binnen je budget',
              'Dieet & voorkeuren',
              'Makkelijk winkelen',
            ].map((text) => (
              <div key={text} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(10px, 2vw, 24px)',
                background: 'rgba(255,255,255,0.92)',
                borderRadius: '50px',
                padding: 'clamp(8px, 1.2vh, 18px) clamp(14px, 2.5vw, 30px)',
                fontWeight: 700,
                fontSize: 'clamp(0.9rem, 1.8vw, 1.4rem)',
                color: '#1a1a1a',
              }}>
                <span style={{
                  width: 'clamp(24px, 2.5vw, 38px)',
                  height: 'clamp(24px, 2.5vw, 38px)',
                  borderRadius: '50%',
                  background: '#2ecc71',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                {text}
              </div>
            ))}

            {/* Groene badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(10px, 2vw, 24px)',
              background: '#2ecc71',
              borderRadius: '50px',
              padding: 'clamp(8px, 1.2vh, 18px) clamp(14px, 2.5vw, 30px)',
              fontWeight: 800,
              fontSize: 'clamp(0.9rem, 1.8vw, 1.4rem)',
              color: 'white',
            }}>
              <span style={{
                width: 'clamp(24px, 2.5vw, 38px)',
                height: 'clamp(24px, 2.5vw, 38px)',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              Binnen 30 seconden klaar
            </div>
          </div>
        </div>

        {/* Knop onderaan */}
        <div style={{
          width: '100%',
          maxWidth: '500px',
          alignSelf: 'center',
          marginBottom: '2.5vh',
        }}>
          <button
            onClick={onStart}
            style={{
              width: '100%',
              padding: 'clamp(12px, 1.8vh, 22px) 0',
              background: '#f5c518',
              border: 'none',
              borderRadius: '50px',
              fontFamily: 'inherit',
              fontWeight: 800,
              fontSize: 'clamp(1rem, 2vw, 1.5rem)',
              color: '#1a1a1a',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(245,197,24,0.5)',
              marginBottom: '1vh',
            }}
          >
            Boodschappenlijst maken
          </button>
          <p style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.85)',
            fontSize: 'clamp(0.7rem, 1vw, 0.9rem)',
            margin: 0,
            fontWeight: 500,
          }}>
            Gratis · geen account nodig
          </p>
        </div>

      </div>
    </div>
  )
}