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

      {/* Achtergrond foto */}
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

      {/* Donkere overlay */}
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
        padding: '2vh 4vw',
        height: '100vh',
        width: '100%',
        boxSizing: 'border-box',
      }}>

        {/* Logo rechtsboven */}
        <img
          src="./assets/logomealyntrans.png"
          alt="Mealyn"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            height: '6vh',
            zIndex: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.64)',
            padding: '4px 8px',
          }}
        />

        {/* Titel */}
        <h1 style={{
          color: 'white',
          fontSize: '7vw',
          fontWeight: 800,
          textAlign: 'center',
          lineHeight: 1.2,
          margin: '5vh 0 3vh',
          textShadow: '0 4px 16px rgba(0,0,0,0.3)',
          width: '100%',
        }}>
          Begin hier met boodschappen
        </h1>

        {/* Bonnetje NAAST feature lijst */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '4vw',
          width: '100%',
          flex: 1,
        }}>

          {/* Bonnetje links */}
          <img
            src="./assets/bonnetje.png"
            alt="Boodschappenlijst voorbeeld"
            style={{
              width: '40vw',
              borderRadius: '8px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
              transform: 'rotate(-2deg)',
              flexShrink: 0,
            }}
          />

          {/* Feature lijst rechts */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5vh',
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
                gap: '2vw',
                background: 'rgba(255,255,255,0.92)',
                borderRadius: '50px',
                padding: '1.8vh 3vw',
                fontWeight: 700,
                fontSize: '4vw',
                color: '#1a1a1a',
              }}>
                <span style={{
                  width: '5vw',
                  height: '5vw',
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
              gap: '2vw',
              background: '#2ecc71',
              borderRadius: '50px',
              padding: '1.8vh 3vw',
              fontWeight: 800,
              fontSize: '4vw',
              color: 'white',
            }}>
              <span style={{
                width: '5vw',
                height: '5vw',
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
        <div style={{ width: '100%', marginBottom: '3vh', marginTop: '3vh' }}>
          <button
            onClick={onStart}
            style={{
              width: '100%',
              padding: '2.5vh 0',
              background: '#f5c518',
              border: 'none',
              borderRadius: '50px',
              fontFamily: 'inherit',
              fontWeight: 800,
              fontSize: '5vw',
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
            fontSize: '2.5vw',
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