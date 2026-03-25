interface Props {
  onStart: () => void
}

export default function WelcomeScreen({ onStart }: Props) {
  return (
    <div>
      <h1>Maaltijdplanner</h1>
      <p>
        Beantwoord 7 korte vragen en ontvang recepten die passen bij jouw
        wensen, dieet en budget.
      </p>
      <button onClick={onStart}>Start</button>
    </div>
  )
}
