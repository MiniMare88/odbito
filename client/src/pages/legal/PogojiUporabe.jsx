import React from 'react'
import LegalLayout, { Sec, P, Ul } from './LegalLayout.jsx'

export default function PogojiUporabe() {
  return (
    <LegalLayout title="POGOJI UPORABE SPLETNE STRANI" subtitle="www.odbito.si" date="september 2026">

      <Sec num="1" title="Splošno" />
      <P>Spletno stran www.odbito.si upravlja Odbito 360 d.o.o., Videm 9b, 1262 Dol pri Ljubljani, Slovenija (v nadaljevanju: Odbito). Spletna stran omogoča informiranje o storitvah gibalnega centra Odbito ter spletno rezervacijo in nakup vstopnic, naročnin in paketov.</P>
      <P>Vsi podatki se prenašajo po varni šifrirani SSL-povezavi. Z nadaljevanjem uporabe spletne strani sprejemate te pogoje.</P>

      <Sec num="2" title="Uporabniški račun" />
      <P>Za nakup in rezervacijo je potrebna registracija z imenom, priimkom, e-naslovom, telefonsko številko in datumom rojstva. Ob registraciji potrdiš odgovornostno izjavo — to narediš samo enkrat. Starši rezervirajo za otroke v okviru svojega računa; otroci nimajo ločenih računov.</P>
      <P>Uporabniško ime je e-naslov. Geslo si izberete sami in ste zanj odgovorni. Odbito ne odgovarja za morebitne zlorabe, ki bi nastale zaradi vaše malomarnosti pri varovanju dostopnih podatkov.</P>
      <P>Podatke v svojem profilu (e-naslov, geslo, osebni podatki) lahko kadar koli uredite v razdelku "Moj račun".</P>

      <Sec num="3" title="Rezervacije in nakup" />
      <P>Celoten postopek rezervacije in plačila poteka prek spletne strani odbito.si. Obiskovalec izbere datum, začetni čas in trajanje paketa. Sistem v realnem času prikaže razpoložljive termine in preostalo kapaciteto.</P>
      <P>Plačilo se izvede prek ponudnika Stripe (varna kreditna in debetna plačila). Ob zaključku nakupa prejmete potrditveni e-mail s QR kodo in možnostjo dodajanja termina v digitalni koledar.</P>
      <P>Pred potrditvijo nakupa preverite vse podatke. Vstopnica postane veljavna s plačilom in ni prenosljiva na drugo osebo.</P>

      <Sec num="4" title="Odpoved in prestavitev termina" />
      <P>Rezervacije ni mogoče samostojno preklicati — za preklic se obrnite na osebje Odbita. Termin lahko enkrat brezplačno prestavite, če to storite vsaj 24 ur pred rezerviranim obiskom. Kasnejše prestavitve niso mogoče.</P>
      <P>V skladu s 43.č členom ZVPot potrošnik nima pravice do odstopa od pogodbe pri storitvah za prosti čas z določenim datumom izvedbe. Vsa opravljena naročila vstopnic so zato zavezujoča.</P>

      <Sec num="5" title="Skupinski popusti" />
      <P>Ob rezervaciji za 5 ali več oseb sistem avtomatično upošteva skupinski popust. Starši lahko rezervirajo za sebe in otroke v eni rezervaciji.</P>

      <Sec num="6" title="Program zvestobe" />
      <P>Vsak zaključen obisk prinese 1 točko. Po 10 zbranih obiskih se na vašem računu avtomatično pojavi voucher za 1 uro brezplačnega prosto skakanja. Ob rojstnem dnevu prejmete 10-odstotni popust za naslednji obisk, veljaven 30 dni.</P>

      <Sec num="7" title="Varstvo osebnih podatkov" />
      <P>Podatke, ki jih posredujete pri registraciji in rezervaciji, obdelujemo v skladu s Politiko varstva zasebnosti, dostopno na www.odbito.si. Vaši podatki ne bodo posredovani nepooblaščenim tretjim osebam.</P>
      <P>Odjavo od e-poštnega obveščanja lahko izvedete prek povezave v vsakem sporočilu ali z zahtevo na info@odbito.si.</P>

      <Sec num="8" title="Pritožbe" />
      <P>Pritožbo ali reklamacijo pošljite pisno na info@odbito.si. V sporočilu navedite kontaktne podatke in opis zadeve. Pritožbe obravnavamo zaupno in v razumnem roku.</P>

      <Sec num="9" title="Spremembe pogojev" />
      <P>Odbito si pridržuje pravico do spremembe teh pogojev. Veljavna različica je vedno na voljo na www.odbito.si. Pogoji, veljavni ob nakupu, urejajo posamezno transakcijo. Za morebitne spore je pristojno sodišče v Ljubljani.</P>

    </LegalLayout>
  )
}
