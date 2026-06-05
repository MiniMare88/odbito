import React from 'react'
import LegalLayout, { Sec, Sub, P, Ul } from './LegalLayout.jsx'

export default function PolitikaPiskotkov() {
  return (
    <LegalLayout title="POLITIKA PIŠKOTKOV" subtitle="www.odbito.si" date="september 2026">

      <Sec num="1" title="Kaj so piškotki?" />
      <P>Piškotki so majhne besedilne datoteke, ki jih spletna stran shrani v vašo napravo ob obisku. Omogočajo, da vas stran prepozna ob naslednjem obisku, si zapomni vaše nastavitve in zagotavlja boljšo uporabniško izkušnjo. Njihovo shranjevanje je pod nadzorom vašega brskalnika — shranjevanje piškotkov lahko kadar koli omejite ali onemogočite.</P>

      <Sec num="2" title="Zakaj jih uporabljamo?" />
      <P>Spletna stran www.odbito.si uporablja piškotke za naslednje namene:</P>
      <Ul items={[
        'Nemoteno delovanje rezervacijskega sistema in nakupnega procesa.',
        'Zapomnitev vaših nastavitev in preferenc.',
        'Analizo obiska in izboljšanje delovanja strani.',
        'Prikazovanje prilagojenih vsebin in ponudb (samo z vašo privolitvijo).',
      ]} />

      <Sec num="3" title="Vrste piškotkov" />

      <Sub label="" title="Nujni piškotki" />
      <P>Brez teh piškotkov osnovno delovanje strani ni mogoče. Vključujejo piškotke za upravljanje seje, varnostne piškotke in tiste, ki omogočajo rezervacijo in plačilo. Njihova uporaba ne zahteva soglasja.</P>

      <Sub label="" title="Analitični piškotki" />
      <P>Zbirajo anonimizirane podatke o tem, kako obiskovalci uporabljajo spletno stran (katere strani obiščejo, kako dolgo ostanejo). Podatki nam pomagajo izboljševati vsebino in strukturo strani. Nobeden od teh podatkov ne identificira posameznika.</P>

      <Sub label="" title="Funkcionalni piškotki" />
      <P>Omogočajo, da si stran zapomni vaše nastavitve (npr. jezikovna nastavitev, prednapolnjeni obrazci). S tem je vaša izkušnja pri ponovnem obisku hitrejša in bolj prilagojena.</P>

      <Sub label="" title="Trženjski piškotki" />
      <P>Uporabljamo jih za prikazovanje prilagojenih oglasov in merjenje učinkovitosti oglaševalskih kampanj. Aktiviramo jih samo na podlagi vašega soglasja, ki ga podate prek pasice za piškotke ob prvem obisku.</P>

      <Sec num="4" title="Upravljanje piškotkov" />
      <P>Soglasje za neobvezne piškotke podate ali prekličete prek nastavitev piškotkov na naši spletni strani. Piškotke lahko upravljate tudi neposredno v nastavitvah vašega brskalnika:</P>
      <Ul items={[
        'Google Chrome: Nastavitve → Zasebnost in varnost → Piškotki',
        'Mozilla Firefox: Možnosti → Zasebnost in varnost → Piškotki in podatki spletnih mest',
        'Safari: Nastavitve → Zasebnost → Upravljaj podatke spletnih mest',
        'Microsoft Edge: Nastavitve → Piškotki in dovoljenja spletnih mest',
      ]} />
      <P>Opozorilo: onemogočanje nujnih piškotkov lahko povzroči nepravilno delovanje rezervacijskega sistema in spletne trgovine.</P>

      <Sec num="5" title="Piškotki tretjih oseb" />
      <P>Nekatere funkcionalnosti (npr. Google Analytics, plačilni sistemi) vključujejo piškotke tretjih ponudnikov. Ti ponudniki imajo lastne politike zasebnosti. Odbito ne odgovarja za ravnanje teh ponudnikov z vašimi podatki.</P>

      <Sec num="6" title="Kontakt" />
      <P>Za vprašanja v zvezi s piškotki nas kontaktirajte na info@odbito.si.</P>

    </LegalLayout>
  )
}
