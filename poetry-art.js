// Небольшие рисунки тушью и мягкими цветовыми пятнами, как в саду на главной.
// Ключ artwork находится рядом с текстом стихотворения в poems.js.
const ink='#967786',paper='#fffbf3',pink='#edbfd0',green='#b5c0ac';
const drawings={
  morning:`<ellipse cx="101" cy="127" rx="77" ry="9" fill="${pink}" opacity=".24"/>
    <path d="M42 100V37q58-19 116 0v63" fill="#e4d2cf" stroke="${ink}" stroke-width="2"/>
    <path d="M37 77h126l9 41H28Z" fill="${paper}" stroke="${ink}" stroke-width="2"/>
    <path d="M28 118v10m144-10v10M34 124h132" stroke="${ink}" stroke-width="2"/>
    <rect x="52" y="39" width="43" height="30" rx="9" fill="${paper}" stroke="${ink}" stroke-width="1.3" transform="rotate(-5 73 54)"/>
    <rect x="102" y="39" width="43" height="30" rx="9" fill="${paper}" stroke="${ink}" stroke-width="1.3" transform="rotate(5 123 54)"/>
    <ellipse cx="80" cy="56" rx="13" ry="15" fill="#f0dbcf" stroke="${ink}" stroke-width="1.4"/>
    <ellipse cx="117" cy="57" rx="13" ry="15" fill="#f0dbcf" stroke="${ink}" stroke-width="1.4"/>
    <path d="M66 57c-6-26 23-31 27-8-12-10-14 4-27 8" fill="#b7a0ad"/>
    <path d="M104 53c-1-21 28-19 28 7l-7 9c2-15-9-11-21-16" fill="#d9afbd"/>
    <path d="m74 59 5 1m31 0 5 1" stroke="${ink}" stroke-width="1.2"/>
    <path d="M40 73q26-12 50 2 26-12 70-1l9 43H30Z" fill="#f2d6df" stroke="${ink}" stroke-width="1.7"/>
    <path d="M91 76q8 17 3 38m-42-25 8 20m72-25-4 17m20-17 5 26" fill="none" stroke="#cbaab7" stroke-width="1.4"/>`,
  knight:`<ellipse cx="105" cy="134" rx="64" ry="7" fill="${pink}" opacity=".26"/>
    <path d="M81 75q-19 10-20 37l-14 13 31 4 19-25" fill="#d9c4cd" stroke="${ink}" stroke-width="2"/>
    <path d="m100 92 19 17-5 24H97l-2-19-18-10" fill="#c9bdcd" stroke="${ink}" stroke-width="2"/>
    <path d="m98 130 25 1 6 5H96Zm-48-7-7 9 29 2 7-7" fill="${paper}" stroke="${ink}" stroke-width="1.7"/>
    <path d="M79 57q10-13 27-4l13 36-24 15-27-16Z" fill="#d3c4d0" stroke="${ink}" stroke-width="2"/>
    <path d="m75 61 13-4 8 14-11 15-17-5Z" fill="${paper}" stroke="${ink}" stroke-width="1.7"/>
    <path d="m77 67 8 9m-10-3 11-5" stroke="#ba879a" stroke-width="2.2"/>
    <path d="M89 47 94 27c7-18 34-5 31 10l-7 20-18 2Z" fill="${paper}" stroke="${ink}" stroke-width="2"/>
    <path d="m92 38 31 6-7 14-17-2Z" fill="#c5afc0" stroke="${ink}" stroke-width="1.5"/>
    <path d="m99 43 6 2m5 1 6 2m-9-22q-4-15 9-18" fill="none" stroke="${ink}" stroke-width="1.5"/>
    <path d="M108 27c0-16 14-20 20-16-11 3-6 15-20 16" fill="${pink}"/>
    <path d="m111 63 16 11 13-3 3 7-19 7-21-10" fill="${paper}" stroke="${ink}" stroke-width="1.8"/>
    <path d="M136 75v57l5 7 4-7V75" fill="#e2d8df" stroke="${ink}" stroke-width="1.7"/>
    <path d="m128 80 25 1m-13-1 1-16m-5 0h9" stroke="${ink}" stroke-width="2.5"/>
    <path d="m130 70 9 1 1 7-10-1" fill="#ead5c9" stroke="${ink}" stroke-width="1.3"/>`,
  hamster:`<ellipse cx="102" cy="127" rx="65" ry="9" fill="${pink}" opacity=".24"/>
    <path d="M38 78 61 60l26 18v44H38Z" fill="#e9d9ce" stroke="${ink}" stroke-width="1.8"/>
    <path d="M31 79 61 53l31 26" fill="none" stroke="${ink}" stroke-width="2"/>
    <path d="M52 122v-18c0-15 22-15 22 0v18" fill="${paper}" stroke="${ink}" stroke-width="1.5"/>
    <ellipse cx="122" cy="100" rx="32" ry="27" fill="#e5cfc3" stroke="${ink}" stroke-width="1.8"/>
    <circle cx="102" cy="63" r="12" fill="#e5cfc3" stroke="${ink}" stroke-width="1.8"/>
    <circle cx="140" cy="63" r="12" fill="#e5cfc3" stroke="${ink}" stroke-width="1.8"/>
    <circle cx="103" cy="64" r="6" fill="${pink}"/><circle cx="139" cy="64" r="6" fill="${pink}"/>
    <ellipse cx="121" cy="85" rx="30" ry="26" fill="${paper}" stroke="${ink}" stroke-width="1.8"/>
    <path d="m109 82 1 1m22-1-1 1m-12 10 3 2 3-2m-3 2v4m-24-8-8-2m10 9-9 1m51-8 8-2m-10 9 9 1" fill="none" stroke="${ink}" stroke-width="2"/>
    <ellipse cx="122" cy="112" rx="15" ry="11" fill="${paper}"/>
    <path d="m107 126-5 2m33-2 6 2" stroke="${ink}" stroke-width="2"/>`,
  boxes:`<ellipse cx="102" cy="129" rx="74" ry="8" fill="${green}" opacity=".22"/>
    <path d="m35 75 42-17 41 18-42 18Z" fill="#f1d4c6" stroke="${ink}" stroke-width="1.8"/>
    <path d="m35 75 1 39 40 16V94m0 36 42-18V76" fill="#eadbcc" stroke="${ink}" stroke-width="1.8"/>
    <path d="m76 94-21-12 22-10 19 11m-41-1v14" fill="none" stroke="${ink}" stroke-width="1.2"/>
    <path d="m116 93 31-10 27 12-32 12Z" fill="${paper}" stroke="${ink}" stroke-width="1.8"/>
    <path d="m116 93 1 27 25 11 31-12 1-24-32 12v24" fill="#e9d8d3" stroke="${ink}" stroke-width="1.8"/>
    <path d="M143 91q0-24 8-37m-9 29q-16-18-18-26m20 17q13-14 23-15" fill="none" stroke="${green}" stroke-width="2.5"/>
    <path d="M150 60q-10-13 4-19 8 14-4 19m-20 6q-13 3-16-11 15-4 16 11m29-1q1-13 15-9-1 12-15 9" fill="${green}" opacity=".7"/>`,
  dream:`<ellipse cx="113" cy="121" rx="64" ry="14" fill="#d9dce0" opacity=".58"/>
    <path d="M151 28c-11 15 3 34 18 28-19 22-47-7-18-28" fill="#ecd6ae"/>
    <path d="M29 111V57m0 24L16 68m13 4 16-20" stroke="${ink}" stroke-width="2" fill="none"/>
    <ellipse cx="27" cy="43" rx="22" ry="25" fill="${pink}" opacity=".6"/>
    <ellipse cx="42" cy="49" rx="18" ry="23" fill="${pink}" opacity=".5"/>
    <path d="M51 88h66v19H51Zm0 7h66m-58 12-4 16m52-16 5 16" fill="${paper}" stroke="${ink}" stroke-width="2"/>
    <path d="M46 108h76m-69-25v25m61-25v25" stroke="${ink}" stroke-width="2"/>
    <path d="M143 118q11-2 12-10 8 0 8 7 12 2 6 7-18 8-26-4" fill="${paper}" stroke="${ink}" stroke-width="1.4"/>
    <path d="m164 112 6 2-6 2m-30 14 38 1m-71-98 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="none" stroke="${ink}" stroke-width="1.2"/>`,
  nature:`<ellipse cx="99" cy="129" rx="75" ry="8" fill="${pink}" opacity=".2"/>
    <path d="M38 115h77M47 114V76h61v38M43 76h69l-9-8H52Z" fill="${paper}" stroke="${ink}" stroke-width="1.8"/>
    <path d="M54 67c-1-33 43-33 47 0Z" fill="#d8bf9e" stroke="${ink}" stroke-width="1.6"/>
    <path d="M78 38V26m-5 5h10M57 85v23m11-23v23m11-23v23m11-23v23m11-23v23" stroke="${ink}" stroke-width="1.5"/>
    <path d="m115 95 56 6-3 33-56-7Z" fill="${paper}" stroke="${ink}" stroke-width="1.8"/>
    <path d="m115 95 23 23 33-17m-59 26 22-15m34 22-22-20" fill="none" stroke="${ink}" stroke-width="1.3"/>
    <path d="M144 87q-1-23 20-35-4 26-20 35l-9 18" fill="${pink}" stroke="${ink}" stroke-width="1.2"/>
    <path d="M34 81q-15-17-8-38m0 13-12-8m12 17 12-10" fill="none" stroke="${ink}" stroke-width="1.5"/>
    <ellipse cx="22" cy="40" rx="15" ry="19" fill="${green}" opacity=".6"/>`,
  walls:`<path d="m30 37 107-18 38 29v78l-107 13-38-29Z" fill="${paper}" stroke="${ink}" stroke-width="1.8"/>
    <path d="M137 19v82l38 25M30 37l38 25 107-14M68 62v77m0-25 69-13" fill="none" stroke="${ink}" stroke-width="1.3" opacity=".65"/>
    <path d="m46 50 71-11 28 17v52" fill="none" stroke="${pink}" stroke-width="2" opacity=".55"/>
    <ellipse cx="106" cy="123" rx="29" ry="6" fill="#c9b7c8" opacity=".3"/>
    <path d="m91 101-10 22 18 4 11-16 11 14 13-5-17-23" fill="#cbbdca" stroke="${ink}" stroke-width="1.6"/>
    <path d="M93 70q15-7 25 2l10 33-41 5-7-23Z" fill="${paper}" stroke="${ink}" stroke-width="1.7"/>
    <path d="m89 78 31 17-5 9-33-18m39-8-31 18 5 10 32-18" fill="#f2e8e4" stroke="${ink}" stroke-width="1.4"/>
    <path d="m114 99 8 1-3 7m3-7 8 9" fill="none" stroke="${ink}" stroke-width="1.5"/>
    <ellipse cx="102" cy="60" rx="12" ry="15" transform="rotate(17 102 60)" fill="#e8d4ca" stroke="${ink}" stroke-width="1.5"/>
    <path d="M90 60c-7-22 22-30 26-8l-3 8-7-9-16 9" fill="#b7a0ae"/>
    <path d="m99 65 4 2m-9 5 5 6" stroke="${ink}" stroke-width="1.2"/>
    <path d="m78 126 15 4m30-6 14-1" stroke="${ink}" stroke-width="2"/>`
};
// Мотивы для следующих строф — в той же манере, без повторения одного рисунка.
Object.assign(drawings,{
  window:`<path d="M47 117V30h92v87Z" fill="${paper}" stroke="${ink}" stroke-width="2"/><path d="M54 108V38h78v70Z" fill="#eddae4"/><circle cx="110" cy="58" r="15" fill="#ecd7af"/><path d="M94 31v83M48 77h90m-6 2 35 42H74Z" fill="#ecd7af" fill-opacity=".26" stroke="${ink}" stroke-width="1.4"/>`,
  embrace:`<ellipse cx="101" cy="124" rx="55" ry="8" fill="${pink}" opacity=".3"/><path d="M59 122V84c0-24 37-25 40-1l2 39m1-1V78c2-22 37-22 39 2v42" fill="#d8c7d1" stroke="${ink}" stroke-width="2"/><circle cx="77" cy="57" r="17" fill="#ead7cd" stroke="${ink}" stroke-width="1.5"/><circle cx="117" cy="54" r="17" fill="#ead7cd" stroke="${ink}" stroke-width="1.5"/><path d="M59 58c-8-30 34-32 36-8L78 44Zm41-6c-5-27 35-31 35 5l-15-13Z" fill="#b9a1af"/><path d="m67 89 51 21 16-12m-8-16-47 25-16-8" fill="none" stroke="${paper}" stroke-width="11"/><path d="m68 89 50 21 16-12m-8-16-47 25-16-8" fill="none" stroke="${ink}" stroke-width="1.5"/>`,
  fridge:`<ellipse cx="104" cy="133" rx="49" ry="5" fill="${pink}" opacity=".2"/><rect x="64" y="21" width="75" height="109" rx="6" fill="${paper}" stroke="${ink}" stroke-width="2"/><path d="M65 58h73m-58-24v12m0 25v17m-8 43v4m58-4v4" stroke="${ink}" stroke-width="2"/><path d="m149 58 4 5-4 5m9 15 4 5-4 5m-10 13 4 4-4 4" fill="none" stroke="${ink}" stroke-width="1.2"/><path d="m105 30 0 16m-7-12 14 8m-14 0 14-8" stroke="#bbadb9" stroke-width="1.3"/>`,
  clock:`<circle cx="91" cy="70" r="39" fill="${paper}" stroke="${ink}" stroke-width="2"/><circle cx="91" cy="70" r="33" fill="none" stroke="${pink}" stroke-width="2"/><path d="m91 44 0 26 18 12m-18-47v7m0 56v7M56 70h7m56 0h7m-62 34-8 15m63-15 8 15" fill="none" stroke="${ink}" stroke-width="2"/><path d="m142 53 21 71h-40Z" fill="#dac4d0" stroke="${ink}" stroke-width="1.5"/><path d="m142 116 9-42m-15 15h12" stroke="${ink}" stroke-width="1.8"/>`,
  lantern:`<path d="M58 119h88M86 117V67m-17 0h36V34H69Zm-7-33 25-15 25 15" fill="${paper}" stroke="${ink}" stroke-width="2"/><ellipse cx="87" cy="51" rx="28" ry="31" fill="#edd6ae" opacity=".38"/><path d="M119 118V92l18-14 20 14v26m-22 0v-15h9v15" fill="${paper}" stroke="${ink}" stroke-width="1.5"/>`,
  threads:`<path d="M25 69c30-30 32 41 66 15m20-14c25-27 30 37 64 12" fill="none" stroke="#b993a6" stroke-width="4"/><path d="m88 81 9-9m-6 13 10 0m10-16-9-7m11 10-11 2" fill="none" stroke="${ink}" stroke-width="1.3"/><path d="M76 39q23-9 45 4M72 113q23-9 47-1" fill="none" stroke="${pink}" stroke-width="1.2"/>`,
  armor:`<path d="m66 36 20-9q14 13 28 0l23 11 15 24-18 11-7 52H75l-8-52-18-11Z" fill="#d7c8d4" stroke="${ink}" stroke-width="2"/><path d="m86 29 14 21 15-21m-15 22v58m-24-41 23 13 27-13" fill="none" stroke="${ink}" stroke-width="1.5"/><path d="m107 64-10 15 9 13-8 21" fill="none" stroke="${paper}" stroke-width="3"/><path d="m93 68 7 0" stroke="#bc879c" stroke-width="2"/>`,
  openArmor:`<ellipse cx="104" cy="128" rx="62" ry="7" fill="${pink}" opacity=".25"/><path d="m63 63 25 2 9 59-40-11Z" fill="#d9cbd4" stroke="${ink}" stroke-width="2"/><path d="m117 65 25-3 8 51-43 11Z" fill="#d9cbd4" stroke="${ink}" stroke-width="2"/><circle cx="101" cy="47" r="21" fill="#ecd6ae" opacity=".65"/><path d="m101 13 0 9m28 9-7 5M73 31l7 5m20 43v40m-17-72 7 0m25 0h7" stroke="${ink}" stroke-width="1.5"/>`,
  path:`<path d="M77 138q55-37 13-65T80 14M120 137q-33-43 19-70t14-53" fill="none" stroke="#e1c6d0" stroke-width="13"/><path d="m47 97 0-37m0 12-13-13m13 20 14-13m89 55V85" fill="none" stroke="${ink}" stroke-width="1.5"/><ellipse cx="46" cy="48" rx="23" ry="27" fill="${green}" opacity=".5"/><ellipse cx="152" cy="77" rx="19" ry="22" fill="${pink}" opacity=".5"/>`,
  bowl:`<path d="M29 101h140m-125 6v14m108-14v14" stroke="${ink}" stroke-width="2"/><path d="M68 79h68q-3 27-34 27T68 79Z" fill="${paper}" stroke="${ink}" stroke-width="2"/><ellipse cx="102" cy="79" rx="34" ry="8" fill="#e3d3c9" stroke="${ink}" stroke-width="1.5"/><path d="m49 64-9-5m10-6-6-9m95-2 7-10" stroke="${pink}" stroke-width="2"/>`,
  cinema:`<path d="M37 39h123v43H37Z" fill="${paper}" stroke="${ink}" stroke-width="1.8"/><path d="m83 46 0 27 21-13Z" fill="${pink}"/><path d="M45 123v-21q0-20 19-20t19 20v21m33 0v-21q0-20 19-20t19 20v21" fill="#d9c4d0" stroke="${ink}" stroke-width="2"/><path d="M38 123h50m21 0h50" stroke="${ink}" stroke-width="3"/>`,
  jacket:`<path d="m72 30 20-5 10 14 10-14 20 5 29 42-23 17-13-18 10 61H68l8-61-15 18-22-17Z" fill="#d7c5ce" stroke="${ink}" stroke-width="2"/><path d="m91 27 11 21 11-21m-11 22v78m-23-29h12m23 0h13" fill="none" stroke="${ink}" stroke-width="1.5"/><path d="M76 45 84 65l17-16 19 16 9-20" fill="none" stroke="${paper}" stroke-width="3"/>`,
  train:`<rect x="36" y="34" width="128" height="90" rx="16" fill="${paper}" stroke="${ink}" stroke-width="2"/><rect x="48" y="47" width="104" height="48" rx="7" fill="#e4d4e0"/><path d="M100 48v47m-50 11h13m73 0h13M53 125l-5 10m97-10 6 10" stroke="${ink}" stroke-width="2"/><circle cx="82" cy="67" r="8" fill="#ead5c9"/><circle cx="102" cy="72" r="8" fill="#ead5c9"/><path d="M70 94V84q6-13 15-5m7 15q-3-16 9-15 14 0 14 15" fill="#bda6b7"/>`,
  pillow:`<path d="M48 56q52-13 104 0l-4 59q-48-10-96 0Z" fill="${paper}" stroke="${ink}" stroke-width="2"/><path d="M56 64q43-9 86 0l-3 42q-40-8-80 0Z" fill="#f2dce4"/><path d="M115 25c-14 13-3 30 11 26-22 18-41-13-11-26" fill="#ecd6ae"/><path d="m73 30 3 6 6 2-6 2-3 6-2-6-6-2 6-2Z" fill="none" stroke="${ink}" stroke-width="1.3"/>`,
  landscape:`<path d="M17 110q36-53 75-14t91 3" fill="${green}" opacity=".35"/><path d="M98 145q58-29 14-46T97 51" fill="none" stroke="#c4cbd5" stroke-width="14"/><path d="M42 110V45m0 10-21 32h42Zm112 5V29m0 8-23 37h46Z" fill="${green}" stroke="${ink}" stroke-width="1.4"/><circle cx="90" cy="40" r="15" fill="#ecd9b4"/>`,
  letter:`<path d="m40 58 114-9 8 76-115 9Z" fill="${paper}" stroke="${ink}" stroke-width="2"/><path d="m41 59 59 44 53-54m-107 83 43-37m73 28-52-29" fill="none" stroke="${ink}" stroke-width="1.4"/><path d="m116 42 22-18-4 30-34 37" fill="${pink}" stroke="${ink}" stroke-width="1.5"/>`,
  winter:`<path d="M26 126q74-19 147 0" fill="none" stroke="${pink}" stroke-width="2"/><path d="M104 123V56m-19 0h37V27H85Zm-6-29 25-13 24 13" fill="${paper}" stroke="${ink}" stroke-width="2"/><ellipse cx="104" cy="43" rx="24" ry="24" fill="#ecd7b3" opacity=".35"/><path d="m40 46 0 16m-7-12 14 8m-14 0 14-8m108 25v14m-6-10 12 6m-12 0 12-6" stroke="${ink}" stroke-width="1.2"/>`,
  heart:`<path d="M100 121C-1 58 54 11 100 52c46-41 101 6 0 69Z" fill="#ecd0dc" stroke="${ink}" stroke-width="1.7"/><path d="m103 52-13 24 17 13-12 30m-9-44 13 3m-2 8 13 3" fill="none" stroke="${paper}" stroke-width="2.8"/>`,
  spring:`<path d="M21 121q58-67 153-83m-99 41-5-31m52 6 12-27" fill="none" stroke="${ink}" stroke-width="2.5"/><g fill="${pink}" opacity=".85"><ellipse cx="72" cy="43" rx="8" ry="17"/><ellipse cx="72" cy="43" rx="17" ry="8"/><ellipse cx="137" cy="27" rx="8" ry="17"/><ellipse cx="137" cy="27" rx="17" ry="8"/></g><path d="m52 93 15-5m85-44 13-2" stroke="${green}" stroke-width="5"/>`,
  eyes:`<path d="M27 81q25-31 53-2m40 0q28-30 53 2" fill="none" stroke="${ink}" stroke-width="2"/><ellipse cx="55" cy="75" rx="8" ry="12" fill="#c6afbf"/><ellipse cx="146" cy="75" rx="8" ry="12" fill="#c6afbf"/><path d="M33 53q22-9 43 1m47 0q21-10 45 0" fill="none" stroke="${pink}" stroke-width="4"/>`,
  branch:`<path d="M21 111 87 77l-7-8 11-10m24 0-7 10 13 3 56-36m-29 20-5-20" fill="none" stroke="${ink}" stroke-width="3"/><path d="M148 35q-5-21 20-18 4 21-20 18" fill="${green}" opacity=".7"/><path d="m90 91 9-11m-5 22 13-16" stroke="${pink}" stroke-width="2"/>`,
  corridor:`<path d="M31 23 78 57h46l46-34v108H31Zm47 34v55m46-55v55m-93 19 47-19h46l46 19" fill="${paper}" stroke="${ink}" stroke-width="1.7"/><path d="M88 70h27v42H88Z" fill="#ecdab8" opacity=".7"/><path d="m40 49 17 11v37l-17 6m103-43 17-11v54l-17-6" fill="none" stroke="${pink}" stroke-width="2"/>`,
  dress:`<path d="M100 20q-12-7-9-14m9 14-30 19h60Zm-19 18 9 27-26 64h73l-26-64 9-27" fill="${paper}" stroke="${ink}" stroke-width="1.8"/><path d="m90 64 21 0m-10 4 0 53m22-45 15 8 10-15-15-8Z" fill="#f0dae2" stroke="${ink}" stroke-width="1.2"/><path d="m130 66-11-14" stroke="${ink}" stroke-width="1.3"/>`,
  breath:`<path d="M31 91h139m-121 0 7 32h90l7-32M61 124v11m80-11v11" fill="${paper}" stroke="${ink}" stroke-width="2"/><path d="M55 90q6-48 48-48 35 0 45 48Z" fill="#eddae2" stroke="${ink}" stroke-width="1.5"/><path d="M103 39q-13-11 0-24m15 21q-9-9 0-18" fill="none" stroke="#b8a0b0" stroke-width="1.5"/>`,
  mirror:`<ellipse cx="101" cy="73" rx="43" ry="56" fill="${paper}" stroke="${ink}" stroke-width="2"/><ellipse cx="101" cy="73" rx="36" ry="49" fill="#e4dae3"/><path d="m106 26-12 29 15 16-23 24 10 23m-3-63-18-2m34 18 21 7" fill="none" stroke="${paper}" stroke-width="2"/><path d="M68 135h66" stroke="${ink}" stroke-width="2"/>`
});
const place=(key,x,y,scale)=>`<g transform="translate(${x} ${y}) scale(${scale})">${drawings[key]}</g>`;
// Составные сцены сопровождают смысловые блоки по две-три строфы.
Object.assign(drawings,{
  morningRoom:`<path d="M7 133h187M136 24v109" fill="none" stroke="${ink}" stroke-width="1" opacity=".45"/>
    <path d="M15 115V49q55-14 113 0v66" fill="#e4d2cf" stroke="${ink}" stroke-width="1.6"/>
    <path d="M11 85h121l6 38H7Z" fill="${paper}" stroke="${ink}" stroke-width="1.6"/>
    <path d="M12 123v9m120-9v9" stroke="${ink}" stroke-width="2"/>
    <path d="m34 52 59-2 9 25-72 2Z" fill="${paper}" stroke="${ink}" stroke-width="1.2"/>
    <ellipse cx="54" cy="64" rx="11" ry="13" fill="#ead5ca" stroke="${ink}" stroke-width="1.2"/>
    <ellipse cx="77" cy="69" rx="11" ry="13" transform="rotate(-18 77 69)" fill="#ead5ca" stroke="${ink}" stroke-width="1.2"/>
    <path d="M42 64c-6-24 24-26 24-8-11-9-11 6-24 8" fill="#b6a1af"/>
    <path d="M66 64c1-18 27-17 24 10l-7 7c3-12-4-14-17-17" fill="#d6abbc"/>
    <path d="m50 68 4 1m18 3 4 0" stroke="${ink}" stroke-width="1"/>
    <path d="M14 84q25-10 48-4 34-8 69 4l5 37H8Z" fill="#eed3df" stroke="${ink}" stroke-width="1.5"/>
    <path d="M57 80q21 17 43 8" fill="none" stroke="#f4e6df" stroke-width="7"/>
    <path d="M57 80q21 17 43 8m-45 9-3 20m57-18 5 17" fill="none" stroke="${ink}" stroke-width="1.1"/>
    <rect x="148" y="55" width="43" height="76" rx="4" fill="${paper}" stroke="${ink}" stroke-width="1.7"/>
    <path d="M149 82h41m-33-18v10m0 18v13" stroke="${ink}" stroke-width="1.4"/>
    <circle cx="168" cy="43" r="12" fill="#f0e2d5" stroke="${ink}" stroke-width="1.5"/>
    <path d="m168 35 0 8 6 3m-14 6-2 4m18-4 2 4" fill="none" stroke="${ink}" stroke-width="1.3"/>`,
  metroEmbrace:`<rect x="13" y="13" width="175" height="130" rx="12" fill="${paper}" stroke="${ink}" stroke-width="1.5"/>
    <rect x="23" y="25" width="154" height="52" rx="5" fill="#ded6e2"/>
    <path d="M23 35h154m-110-9v28m74-28v28M22 99h156v17H22Z" fill="#d9c5d1" stroke="${ink}" stroke-width="1.3"/>
    <path d="m63 54 0 8q4 5 8 0v-8m66 0v8q4 5 8 0v-8" fill="none" stroke="${ink}" stroke-width="1.2"/>
    <path d="M65 97V78q7-19 23-2l7 24m0 0 1-21q12-14 23 4l7 17" fill="#c7b2c3" stroke="${ink}" stroke-width="1.4"/>
    <ellipse cx="78" cy="60" rx="11" ry="13" fill="#ead5c9" stroke="${ink}" stroke-width="1.1"/>
    <ellipse cx="102" cy="70" rx="11" ry="13" transform="rotate(-25 102 70)" fill="#ead5c9" stroke="${ink}" stroke-width="1.1"/>
    <path d="M66 61c-5-24 26-24 25-6l-16-5-9 11" fill="#b6a0af"/>
    <path d="M93 65c0-19 26-17 24 7l-9 10c5-14-2-12-15-17" fill="#d1a7ba"/>
    <path d="m74 65 4 0m19 7 5 0" stroke="${ink}" stroke-width="1.1"/>
    <path d="M90 81q18-8 31 5l10 21-38 3-9-21Z" fill="#e5d7ce" stroke="${ink}" stroke-width="1.3"/>
    <path d="m94 82 7 12 7-11m-3 11 9 9M68 101l2 27 10 0 2-28m24 9 1 20 11 0 1-20" fill="none" stroke="${ink}" stroke-width="1.4"/>
    <path d="m71 82-12-10-3 4 12 14m30-11 17 5" fill="none" stroke="${ink}" stroke-width="2"/>
    <path d="m57 72-10-4" stroke="#bea393" stroke-width="2.7"/><path d="m47 66-4-2" stroke="${ink}" stroke-width="1"/>
    <path d="M44 61q-8-5-2-10t-2-12" fill="none" stroke="${ink}" stroke-width="1" opacity=".65"/>
    <path d="m43 119 19-1 2 22-23 1Zm28 6 17-2 5 18-23 1Z" fill="#eadacc" stroke="${ink}" stroke-width="1.3"/>
    <path d="M47 119v-5q5-6 10 0v5m18 5v-6q5-6 10 0v5" fill="none" stroke="${ink}" stroke-width="1.2"/>`,
  knightShelter:`<path d="M9 132h184" stroke="${ink}" stroke-width="1" opacity=".5"/>
    <path d="M22 126V65l35-25 37 25v61" fill="${paper}" stroke="${ink}" stroke-width="1.6"/>
    <path d="m17 66 40-33 43 33" fill="none" stroke="${ink}" stroke-width="2"/>
    <path d="M43 126V91q14-21 29 0v35" fill="#ecd6ad" opacity=".65"/>
    <path d="m72 125 42 8 38-6" fill="none" stroke="#e6cbd6" stroke-width="8"/>
    <path d="M117 101h59v16h-59Zm0 8h59m-50 9-3 13m43-13 4 13" fill="${paper}" stroke="${ink}" stroke-width="1.5"/>
    <path d="M116 88q16-19 28 4m10-4 21 4m-31 0 7 0m2-4-4-6" fill="none" stroke="#b591a5" stroke-width="2"/>
    <path d="M174 97V37m-8 0h16v-18h-16Z" fill="${paper}" stroke="${ink}" stroke-width="1.2"/>`,
  knightRelease:`${place('openArmor',-10,37,.68)}
    <path d="M123 128V26h57v102" fill="#eedbb9" fill-opacity=".5" stroke="${ink}" stroke-width="1.7"/>
    <path d="m124 28 35 13v84l-35 3Z" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>
    <circle cx="145" cy="77" r="8" fill="#e5cec5" stroke="${ink}" stroke-width="1.2"/>
    <path d="M136 88q10-8 18 1l4 24-24 0Zm4 25-2 16m13-16 3 16" fill="#d1bdcb" stroke="${ink}" stroke-width="1.4"/>
    <path d="m107 134 14-3m-3-8 13 1" stroke="${pink}" stroke-width="2"/>`,
  emptyHouse:`<path d="M17 120h169m-153 1v13m137-13v13" fill="none" stroke="${ink}" stroke-width="2"/>
    <path d="M32 84 66 54l35 30v34H32Z" fill="#e9d9ce" stroke="${ink}" stroke-width="1.5"/>
    <path d="m27 85 39-38 41 38M53 118V97q12-17 25 0v21" fill="${paper}" stroke="${ink}" stroke-width="1.5"/>
    <circle cx="143" cy="83" r="25" fill="none" stroke="#bda5b4" stroke-width="2"/>
    <path d="m143 83-13-16m13 16 18-8m-18 8 1 24m-16 11h32" stroke="${ink}" stroke-width="1.2"/>
    <path d="M91 108h34q-1 12-17 12t-17-12Z" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>`,
  dreamWaking:`<path d="M21 123V81h91v42m-97-24h103m-91 25v9m79-9v9" fill="${paper}" stroke="${ink}" stroke-width="1.5"/>
    <path d="m29 85 28-3 5 15-35 1Z" fill="#efdae2" stroke="${ink}" stroke-width="1.2"/>
    <path d="M38 62V20h53v42Zm27-41v40M39 43h51" fill="#eee2d0" fill-opacity=".5" stroke="${ink}" stroke-width="1.3"/>
    <path d="M141 128V31h37v97m-36-95 24 11v80" fill="${paper}" stroke="${ink}" stroke-width="1.5"/>
    <path d="m117 128 6-2m-3-10 6 0m4-7 5-2" stroke="#bca0af" stroke-width="2"/>`,
  winterBridge:`<path d="M14 117q79-25 174 1m-163-9q70-58 146-3m-145 8v-23m23 11V78m25 14V69m26 22V67m26 25V74m25 29V86m23 27V99" fill="none" stroke="${ink}" stroke-width="1.7"/>
    <path d="M22 135q49-8 78-1t79-2" fill="none" stroke="#cbd2dc" stroke-width="5"/>
    <path d="M49 70V28m-9 0h19V9H40Zm-4-19 13-7 14 7" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>
    <path d="m139 20 0 14m-6-11 12 8m-12 0 12-8" stroke="#c6acbb" stroke-width="1.4"/>`,
  harvestHeart:`<path d="M18 127q82-22 165 0" fill="none" stroke="${green}" stroke-width="4" opacity=".5"/>
    <path d="M44 120V45m0 22-13-13m13 25 15-15m-15 32-14-9M70 121V35m0 24-11-12m11 24 14-13m-14 28-12-10" fill="none" stroke="#c2ac86" stroke-width="2"/>
    ${place('heart',85,39,.55)}
    <path d="m103 119 51-8 7 20-54 8Z" fill="${paper}" stroke="${ink}" stroke-width="1.2"/>`,
  riverLetter:`${place('landscape',-9,-3,1)}
    <path d="m100 107 60-9 12 30-66 10Z" fill="${paper}" stroke="${ink}" stroke-width="1.4"/>
    <path d="m101 107 34 14 25-23m-54 39 23-20m42 10-30-9" fill="none" stroke="${ink}" stroke-width="1.1"/>`,
  springFarewell:`${place('spring',-10,-8,.85)}
    <path d="M81 109h86v16H81Zm0 8h86m-75 9-4 12m66-12 5 12" fill="${paper}" stroke="${ink}" stroke-width="1.5"/>
    <path d="M28 142q77-16 48-47" fill="none" stroke="#e3cad6" stroke-width="10"/>
    <path d="m58 115 7-2m-3 9 7-1" stroke="${ink}" stroke-width="1.2"/>`,
  forestFracture:`${place('landscape',0,0,.95)}
    <path d="m73 121 25-12-5-5 9-9m12 1-6 8 9 2 44-25m-11 6-2-16" fill="none" stroke="${ink}" stroke-width="2.3"/>
    <path d="M149 74q-9-12 8-19 11 12-8 19" fill="${green}" opacity=".7"/>`,
  wardCoat:`${place('corridor',0,0,.95)}
    <path d="m133 69 11-5 8 8 8-8 11 5 17 34-14 7-6-15 4 36h-43l4-36-6 15-13-7Z" fill="${paper}" stroke="${ink}" stroke-width="1.2"/>
    <path d="m144 65 8 16 8-16m-8 16v45m-13-22h7m14 0h7" fill="none" stroke="#ba9eae" stroke-width="1.2"/>`,
  dressHall:`${place('corridor',48,5,.8)}${place('dress',-9,12,.8)}`,
  cradleMirror:`${place('breath',-20,24,.8)}${place('mirror',95,2,.65)}
    <path d="M17 137h173" stroke="${ink}" stroke-width="1" opacity=".4"/>`,
  targetForest:`<path d="M31 132V34m0 19L13 79h36Zm126 76V23m0 15-21 34h42Z" fill="${green}" fill-opacity=".35" stroke="${ink}" stroke-width="1.3"/>
    <circle cx="100" cy="72" r="34" fill="${paper}" stroke="${ink}" stroke-width="1.7"/><circle cx="100" cy="72" r="23" fill="#ecd0dd" stroke="${ink}" stroke-width="1.1"/><circle cx="100" cy="72" r="10" fill="${paper}" stroke="${ink}" stroke-width="1"/>
    <path d="m85 102-12 31m42-31 13 31m-43-1 22-10-2-6m10-7-5 8 7 2 25-12" fill="none" stroke="${ink}" stroke-width="1.6"/>`,
  mindRoom:`<path d="m28 33 111-17 38 31v80L65 139l-37-28Z" fill="${paper}" stroke="${ink}" stroke-width="1.5"/>
    <path d="M139 17v87l38 23M28 33l37 29 112-15M65 62v77m0-22 74-13" fill="none" stroke="${ink}" stroke-width="1.2"/>
    <path d="m95 70 24-3v37l-24 2Zm0 20 24-2m-18-20v36" fill="#ead8e3" fill-opacity=".5" stroke="#bda4b4" stroke-width="1.1"/>
    <path d="M83 121v-16h21v16m-21-7h21m-18 7-2 10m18-10 2 8" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>
    <path d="m43 19 88-12 52 30" fill="none" stroke="${pink}" stroke-width="1.7" opacity=".6"/>`
});
export function poetryArtMarkup(key) {
  const drawing=drawings[key];
  if(!drawing)return '';
  return `<svg class="poem-miniature" viewBox="0 0 200 150" aria-hidden="true" focusable="false" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="104" cy="83" rx="79" ry="53" fill="${pink}" opacity=".1"/><ellipse cx="94" cy="78" rx="70" ry="51" fill="${paper}" opacity=".5"/>${drawing}<path d="M176 72c-9-4-5-12 2-12 5 6 3 10-2 12M24 117c-6-2-4-8 1-9 4 4 3 7-1 9" fill="${pink}" opacity=".6"/></svg>`;
}
