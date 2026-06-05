import React from 'react'
import LegalLayout, { Sec, P, Ul } from './LegalLayout.jsx'

export default function PogojiNagradnihIger() {
  return (
    <LegalLayout
      title="SPLOŠNI POGOJI NAGRADNIH IGER"
      subtitle="Odbito 360 d.o.o. — družbena omrežja in spletna stran"
      date="september 2026">

      <Sec num="1" title="Organizator" />
      <P>Organizator nagradnih iger je Odbito 360 d.o.o., Videm 9b, 1262 Dol pri Ljubljani, Slovenija (v nadaljevanju: Odbito), ki upravlja gibalni center Odbito na Dolgem mostu v Ljubljani.</P>

      <Sec num="2" title="Splošna pravila" />
      <P>Sodelovanje v nagradnih igrah je brezplačno in ni pogojeno z nakupom. Stroške internetne povezave nosi udeleženec sam.</P>
      <P>V nagradnih igrah ne smejo sodelovati zaposleni Odbita in njihovi bližnji družinski člani ter zunanji pogodbeni sodelavci.</P>
      <P>Posamezni udeleženec prejme le eno nagrado. Nagrada ni izplačljiva v gotovini niti zamenljiva za drug produkt ali storitev, razen če je to posebej navedeno.</P>

      <Sec num="3" title="Sodelovanje" />
      <P>Pogoji za sodelovanje so podrobno opisani pri vsaki posamični nagradni igri (objava na spletni strani ali družbenem omrežju). Tipični načini sodelovanja so: komentar pod objavo, označitev prijateljev, vpis e-naslova na pristajalni strani ali odgovor na vprašanje.</P>
      <P>Odbito si pridržuje pravico izločiti udeležence, ki kršijo pogoje sodelovanja, so prijavljeni z lažnimi podatki ali poskušajo nadvladati pošteni potek igre.</P>

      <Sec num="4" title="Žrebanje in rezultati" />
      <P>Žrebanje poteka naključno, pod nadzorom komisije, ki jo sestavljajo predstavniki Odbita. Datum žrebanja je naveden v opisu posamične nagradne igre, najkasneje pa v 14 dneh po njenem zaključku.</P>
      <P>Rezultati nagradne igre so dokončni. Ugovor nanje ni mogoč.</P>

      <Sec num="5" title="Obvestilo in prevzem nagrade" />
      <P>Nagrajenec je o nagradi obveščen prek sporočila na platformi, kjer je potekala nagradna igra, ali na e-naslov, ki ga je vpisal ob prijavi.</P>
      <P>Nagrajenec ima 30 dni od obvestila, da posreduje potrebne podatke za prevzem nagrade. Če tega ne stori v roku, nagrada zapade.</P>
      <P>Nagrade so obdavčene v skladu z Zakonom o dohodnini. Za prevzem nagrade mora nagrajenec posredovati: ime in priimek, naslov, davčno številko (le pri nagradi z davčno obveznostjo). Akontacijo dohodnine obračuna Odbito.</P>
      <P>Če je izžrebana oseba mlajša od 18 let, nagrado prevzamejo starši ali zakoniti zastopnik.</P>

      <Sec num="6" title="Varstvo osebnih podatkov" />
      <P>Osebne podatke, zbrane v okviru nagradne igre, obdelujemo izključno za namen izvedbe žrebanja in podelitve nagrade, v skladu s Politiko varstva zasebnosti Odbita, dostopno na www.odbito.si.</P>
      <P>Podatki se po zaključku nagradne igre ne bodo uporabljali za tržne namene brez ločene privolitve udeleženca. Privolitev za e-poštno obveščanje o ponudbi Odbita je prostovoljna in jo je mogoče kadar koli preklicati.</P>

      <Sec num="7" title="Spremembe pogojev" />
      <P>Odbito si pridržuje pravico do spremembe ali prekinitve nagradne igre v primeru tehničnih, komercialnih ali drugih nepredvidenih razlogov. O morebitnih spremembah bodo udeleženci obveščeni prek spletne strani ali družbenih omrežij.</P>

      <Sec num="8" title="Veljavnost" />
      <P>S sodelovanjem v nagradni igri udeleženec sprejema te splošne pogoje in pogoje, objavljene na www.odbito.si. Hkrati sprejema tudi pogoje in pravila družabnih omrežij, na katerih nagradna igra poteka.</P>
      <div className="rounded-xl px-5 py-4 mt-4"
        style={{ background: 'rgba(250,177,32,0.06)', border: '1px solid rgba(250,177,32,0.2)' }}>
        <p className="font-condensed text-sm" style={{ color: 'rgba(245,245,240,0.75)', lineHeight: 1.75 }}>
          Nagradna igra ni sponzorirana s strani Meta, Instagram ali katerega koli drugega družbenega omrežja.
        </p>
      </div>

    </LegalLayout>
  )
}
