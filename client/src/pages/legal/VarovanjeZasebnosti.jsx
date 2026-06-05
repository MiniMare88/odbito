import React from 'react'
import LegalLayout, { Sec, Sub, P, Ul } from './LegalLayout.jsx'

export default function VarovanjeZasebnosti() {
  return (
    <LegalLayout title="POLITIKA VARSTVA ZASEBNOSTI" date="september 2026">

      <Sec num="1" title="Uvod" />
      <P>Ta politika varstva zasebnosti (v nadaljevanju: Politika) je pripravljena v skladu s Splošno uredbo (EU) 2016/679 o varstvu osebnih podatkov (GDPR), Zakonom o varstvu osebnih podatkov (ZVOP-2, Uradni list RS, št. 163/22) ter drugo veljavno slovensko zakonodajo.</P>
      <P>Politika velja za vse obiskovalce spletne strani www.odbito.si, uporabnike spletnih storitev ter stranke, ki obiščejo gibalni center Odbito na Dolgem mostu v Ljubljani.</P>
      <P>V družbi Odbito 360 d.o.o. se zavedamo pomena zasebnosti. Osebne podatke obdelujemo zakonito, pošteno in pregledno — izključno za vnaprej določene namene in v obsegu, ki je za to nujno potreben.</P>

      <Sec num="2" title="Upravljavec osebnih podatkov" />
      <Ul items={[
        'Podjetje: Odbito 360 d.o.o.',
        'Naslov: Videm 9b, 1262 Dol pri Ljubljani, Slovenija',
        'Spletna stran: www.odbito.si',
        'Telefon: 040 566 926',
        'E-naslov: info@odbito.si',
      ]} />

      <Sec num="3" title="Pooblaščena oseba za varstvo podatkov (DPO)" />
      <Ul items={[
        'Ime: Marko Knafelc',
        'E-naslov: info@odbito.si',
        'Poštni naslov: Odbito 360 d.o.o. – DPO, Videm 9b, 1262 Dol pri Ljubljani, Slovenija',
      ]} />

      <Sec num="4" title="Nameni in pravne podlage obdelave" />

      <Sub label="a)" title="Registracija uporabnika" />
      <P>Ob registraciji zbiramo ime in priimek, datum rojstva ter elektronski naslov. Podlaga: pogodba (čl. 6(1)(b) GDPR).</P>

      <Sub label="b)" title="Rezervacija in koriščenje storitev" />
      <P>Ob nakupu ali rezervaciji termina obdelujemo podatke, potrebne za izpolnitev storitve (podatki o obisku, paketu, plačilu). Pri storitvah za otroke (Odbito akademija, rojstni dnevi) zakoniti zastopnik posreduje podatke otroka, vključno z morebitnimi zdravstvenimi posebnostmi za namene varnosti. Podlaga: pogodba (čl. 6(1)(b) GDPR) oz. privolitev (čl. 9(2)(a) GDPR) za zdravstvene podatke.</P>

      <Sub label="c)" title="Fotografije in videoposnetki" />
      <P>Fotografije ali videoposnetke objavljamo na spletni strani in družbenih omrežjih Odbita samo na podlagi vašega izrecnega soglasja. Podlaga: privolitev (čl. 6(1)(a) GDPR). Soglasje lahko kadar koli prekličete.</P>

      <Sub label="d)" title="Neposredno obveščanje" />
      <P>Naročnike na novice obveščamo o akcijah, novostih in prostih terminih. Obveščanje po e-pošti na podlagi obstoječega poslovnega razmerja je dopustno po ZEKom-2 (čl. 226). Od prejemanja sporočil se lahko kadar koli odjavite prek povezave v sporočilu ali na naslov info@odbito.si.</P>

      <Sub label="e)" title="Analitika in trženje" />
      <P>Anonimizirane podatke o obiskih uporabljamo za izboljšanje storitev in sprejemanje poslovnih odločitev. Podlaga: zakoniti interes (čl. 6(1)(f) GDPR). Personalizirane ponudbe pošiljamo le z vašo privolitvijo.</P>

      <Sub label="f)" title="Nagradne igre" />
      <P>Ob sodelovanju v nagradni igri zbiramo podatke, potrebne za izvedbo žrebanja in podelitev nagrade (ime, priimek, e-naslov, naslov, davčna številka pri nagradi z davčno obveznostjo). Podlaga: pogodba (čl. 6(1)(b) GDPR).</P>

      <Sub label="g)" title="Videonadzor" />
      <P>Prostore centra varujemo z videonadzornim sistemom. Namen je varnost obiskovalcev, zaposlenih in premoženja. Podlaga: zakoniti interes (čl. 6(1)(f) GDPR v povezavi s čl. 76–80 ZVOP-2). Podrobnosti so v ločenem Obvestilu o videonadzoru.</P>

      <Sub label="h)" title="Evidenca poškodb in incidentov" />
      <P>Evidenco morebitnih poškodb ali nezgod vodimo za namene zavarovalnih postopkov in zakonskih obveznosti. Podlaga: zakonska obveznost (čl. 6(1)(c) GDPR) in zakoniti interes (čl. 6(1)(f) GDPR).</P>

      <Sub label="i)" title="Piškotki" />
      <P>Spletna stran www.odbito.si uporablja piškotke. Podrobnosti so opisane v ločeni Politiki piškotkov.</P>

      <Sec num="5" title="Uporabniki in prejemniki podatkov" />
      <P>Osebni podatki so dostopni zaposlenim in pogodbenim partnerjem Odbita, ki jih potrebujejo za opravljanje storitev (vzdrževanje sistema, pošiljanje e-pošte, obdelava plačil, računovodstvo, analitika). Vsi so zavezani k varovanju podatkov.</P>
      <P>Podatke posredujemo tretjim osebam samo, kadar to zahteva zakon (npr. davčni organi, sodišče, policija).</P>

      <Sec num="6" title="Prenosi v tretje države" />
      <P>Določeni ponudniki storitev (npr. e-poštna platforma, analitika) so lahko locirani izven EU. V takih primerih zagotovimo ustrezne zaščitne ukrepe (standardne pogodbene klavzule ali sklep o ustreznosti po GDPR). Za podrobnosti se obrnite na DPO.</P>

      <Sec num="7" title="Roki hrambe" />
      <Ul items={[
        'Registracijski podatki: 5 let od zadnje aktivnosti.',
        'Podatki o obiskih in storitvah: 5 let od zadnjega obiska.',
        'Fotografije in videoposnetki (na podlagi privolitve): do preklica soglasja.',
        'Neposredno trženje: do 1 leta od zadnje komunikacije oz. do odjave.',
        'Nagradne igre: 2 meseca po zaključku; v primeru davčne obveznosti 10 let.',
        'Posnetki videonadzora: največ 30 dni.',
      ]} />
      <P>Po izteku roka hrambe podatke izbrišemo ali anonimiziramo, razen če zakon zahteva drugače.</P>

      <Sec num="8" title="Vaše pravice" />
      <P>V zvezi z obdelavo vaših osebnih podatkov imate naslednje pravice:</P>
      <Ul items={[
        'Pravica do dostopa — vpogled v podatke, ki jih obdelujemo o vas.',
        'Pravica do popravka — zahteva za popravo netočnih ali dopolnitev nepopolnih podatkov.',
        'Pravica do izbrisa ("pravica do pozabe") — kadar za obdelavo ni več zakonite podlage.',
        'Pravica do omejitve obdelave — v primerih, določenih z GDPR.',
        'Pravica do prenosljivosti — prenos podatkov v strojno berljivi obliki, kadar je to tehnično izvedljivo.',
        'Pravica do ugovora — zlasti pri obdelavi na podlagi zakonitega interesa ali za namen neposrednega trženja.',
        'Pravica do pritožbe — pri Informacijskem pooblaščencu RS (Dunajska cesta 22, 1000 Ljubljana, www.ip-rs.si).',
      ]} />
      <P>Za uveljavljanje katere koli pravice nas kontaktirajte na info@odbito.si.</P>

      <Sec num="9" title="Varnostni ukrepi" />
      <P>Odbito 360 d.o.o. izvaja ustrezne tehnične in organizacijske varnostne ukrepe za zaščito osebnih podatkov pred nepooblaščenim dostopom, izgubo ali zlorabo, v skladu s standardi dobre prakse.</P>

      <Sec num="10" title="Spremembe politike" />
      <P>Politiko varstva zasebnosti lahko kadar koli posodobimo. Veljavna različica je vedno dostopna na www.odbito.si. Za vprašanja se obrnite na info@odbito.si.</P>

    </LegalLayout>
  )
}
