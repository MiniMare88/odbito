import React from 'react'
import LegalLayout, { Sec, P, Ul, Info } from './LegalLayout.jsx'

export default function ObvestiloVideonadzor() {
  return (
    <LegalLayout
      title="OBVESTILO O VIDEONADZORU"
      subtitle="v skladu s 3. odstavkom 76. člena ZVOP-2"
      date="september 2026">

      <P>Obvestilo je objavljeno v skladu z določili Zakona o varstvu osebnih podatkov (ZVOP-2, Uradni list RS, št. 163/2022) glede izvajanja videonadzora v prostorih gibalnega centra Odbito.</P>

      <Info rows={[
        ['Upravljavec', 'Odbito 360 d.o.o., Videm 9b, 1262 Dol pri Ljubljani, Slovenija'],
        ['Telefon', '040 566 926'],
        ['E-naslov', 'info@odbito.si'],
        ['DPO', 'Marko Knafelc, e-pošta: info@odbito.si'],
        ['Namen', 'Zagotavljanje varnosti obiskovalcev, zaposlenih in premoženja na območju gibalnega centra Odbito, v skladu s čl. 77 in 78 ZVOP-2 ter čl. 6(1)(f) GDPR.'],
        ['Območje snemanja', 'Vhodni prostor, recepcija, dvorana za skakanje, hodniki in skupni prostori centra. Sanitarni prostori in slačilnice niso pod videonadzorom.'],
        ['Dostop do posnetkov', 'Pooblaščeni zaposleni v Odbito 360 d.o.o. in po potrebi pristojni organi (policija, sodišče).'],
        ['Prenos v tretje države', 'Posnetki se ne prenašajo v tretje države.'],
        ['Rok hrambe', 'Posnetki se hranijo največ 30 dni, nato se samodejno prepišejo.'],
        ['Zvočni nadzor', 'Ne izvaja se.'],
        ['Avtomatizirano odločanje', 'Ne izvaja se.'],
      ]} />

      <Sec num="" title="Pravice posameznika" />
      <P>Vsak posameznik, ki ga je posnela videonadzorna kamera, ima naslednje pravice:</P>
      <Ul items={[
        'Pravica do vpogleda v posnetek, ki se nanaša nanj.',
        'Pravica do anonimizacije ali izbrisa posnetka.',
        'Pravica do omejitve obdelave.',
        'Pravica do ugovora obdelavi.',
        'Pravica do kopije posnetka (prenosljivost).',
      ]} />
      <P>Zahtevo za uveljavljanje pravic naslovite na: Odbito 360 d.o.o., Videm 9b, 1262 Dol pri Ljubljani, Slovenija ali na e-naslov: info@odbito.si.</P>
      <P>Pritožbo v zvezi z videonadzornim sistemom lahko vložite pri Informacijskem pooblaščencu RS (www.ip-rs.si).</P>

      <div className="rounded-xl px-5 py-4 mt-6"
        style={{ background: 'rgba(250,177,32,0.06)', border: '1px solid rgba(250,177,32,0.2)' }}>
        <p className="font-condensed text-sm" style={{ color: 'rgba(245,245,240,0.75)', lineHeight: 1.75 }}>
          <strong style={{ color: 'var(--accent)' }}>Opomba:</strong> vstop v prostore gibalnega centra Odbito pomeni, da ste bili seznanjeni z izvajanjem videonadzora. Vsak posameznik ima pravico, da v nadzorovane prostore ne vstopi.
        </p>
      </div>

    </LegalLayout>
  )
}
