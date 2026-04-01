interface Props {
  onStart: () => void
}

export default function WelcomeScreen({ onStart }: Props) {
  return (
    <div>
      <h1>Mealyn</h1>
      <p>
        Beantwoord 7 korte vragen en ontvang recepten die passen bij jouw
        wensen, dieet en budget.
      </p>

      <p>Voor ontbij,lunch en snacks, moeten er producten bij komen te staan GEEN recepten. Deze items moet je weg kunnen halen</p>
      <button onClick={onStart}>Start</button>
    </div>
  )
}
