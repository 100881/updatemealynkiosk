interface Props {
  onStart: () => void
}

export default function WelcomeScreen({ onStart }: Props) {
  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      width: '100%',
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
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.6) 100%)',
        zIndex: 1,
      }} />

      <div style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 24px 40px',
        minHeight: '100vh',
      }}>

        {/* Logo */}
        <img
            src="./assets/mealynlogo.png"
  alt="Mealyn"
  style={{
    position: 'absolute',
    top: 0,
    right: 0,
    height: '60px',
    zIndex: 3,
  }}
        />

        <h1 style={{
          color: 'white',
          fontSize: '36px',
          fontWeight: 800,
          textAlign: 'center',
          lineHeight: 1.2,
          margin: '0 0 32px',
          textShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}>
          Begin hier met<br />boodschappen
        </h1>

        <img
          src="./assets/bonnetje.png"
          alt="Boodschappenlijst voorbeeld"
          style={{
            width: '160px',
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
            marginBottom: '32px',
            transform: 'rotate(-2deg)',
          }}
        />

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '100%',
          maxWidth: '320px',
          marginBottom: '12px',
        }}>
          {[
            'Binnen je budget',
            'Dieet & voorkeuren',
            'Makkelijk winkelen',
          ].map((text) => (
            <div key={text} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(255,255,255,0.92)',
              borderRadius: '50px',
              padding: '12px 20px',
              fontWeight: 700,
              fontSize: '15px',
              color: '#1a1a1a',
            }}>
              <span style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: '#2ecc71',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              {text}
            </div>
          ))}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: '#2ecc71',
            borderRadius: '50px',
            padding: '12px 20px',
            fontWeight: 800,
            fontSize: '15px',
            color: 'white',
          }}>
            <span style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            Binnen 30 seconden klaar
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ width: '100%', maxWidth: '320px' }}>
          <button
            onClick={onStart}
            style={{
              width: '100%',
              padding: '18px',
              background: '#f5c518',
              border: 'none',
              borderRadius: '50px',
              fontFamily: 'inherit',
              fontWeight: 800,
              fontSize: '18px',
              color: '#1a1a1a',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(245,197,24,0.5)',
              marginBottom: '10px',
            }}
          >
            Boodschapenlijst maken
          </button>
          <p style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.85)',
            fontSize: '13px',
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