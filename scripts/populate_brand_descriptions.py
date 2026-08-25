import json
import urllib.request
import re

# Custom descriptions for prominent brands
CUSTOM_DESCRIPTIONS = {
    "baby-audio": "Baby Audio are a Pasadena-based company developing creative audio tools for music production. Buy Baby Audio Plugins here at ProducerToy with confidence, read reviews and customer feedback about Baby Audio Software.",
    "fabfilter": "FabFilter is a Dutch audio software company creating award-winning VST, AU and AAX equalizer, dynamic, reverb and distortion plugins famous for sleek user interfaces and pristine audio quality.",
    "slate-digital": "Slate Digital provides industry-leading analog-modeled audio plugins, virtual mix racks, synths, and vocal processing suites used by top Grammy-winning audio engineers.",
    "arturia": "Arturia is a French music electronics company specializing in iconic software synth emulations, analog modeling virtual instruments, and creative audio effects plugins.",
    "native-instruments": "Native Instruments is a powerhouse in digital music creation, famous for KONTAKT sampling platform, MASSIVE synth, Guitar Rig, and extensive sound expansion libraries.",
    "valhalladsp": "ValhallaDSP designs creative signal processing audio plugins with a focus on pristine algorithmic reverbs, delays, and immersive space modulators.",
    "tokyo-dawn": "Tokyo Dawn Records & Labs craft high-precision mastering EQ, dynamic range compressor, and audio restoration plugins engineered with exceptional transparency.",
    "producer-toy": "ProducerToy is your ultimate audio production hub offering exclusive studio VST plugins, 808 sample toolkits, vocal chain presets, and free producer utilities.",
    "toy-audio": "Toy Audio crafts boutique analog-flavored saturation units, filter modulators, and signature preset kits tailored for modern hip-hop, electronic, and pop music producers.",
    "soundcraft": "SoundCraft specializes in studio-grade audio mixing software, digital channel strip emulations, and pristine audio routing plugins.",
    "soundtoys": "Soundtoys brings color, character, and creative analog flavor to your digital audio workstation with iconic plugins like Decapitator, EchoBoy, Crystallizer, and Little AlterBoy.",
    "izotope": "iZotope creates intelligent audio technology, groundbreaking mastering software like Ozone, audio repair suites like RX, and vocal mixing tools like Nectar.",
    "cableguys": "Cableguys develop innovative rhythmic effect plugins like ShaperBox, HalfTime, and Curve synth, empowering producers with dynamic audio manipulation.",
    "output": "Output creates modern virtual instruments, revolutionary sample engines, and creative FX plugins tailored for film scorers, beatmakers, and electronic producers.",
    "waves": "Waves Audio is the leading provider of audio signal processing software and VST plugins for mixing, mastering, live sound, and music production.",
    "xfer-records": "Xfer Records is best known for Serum, the world-benchmark wavetable synthesizer, as well as essential producer utilities like LFOTool and OTT.",
    "kilohearts": "Kilohearts creates modular snapin ecosystem software, including Phase Plant synth and Multipass, allowing modular multi-fx signal routing.",
    "u-he": "u-he builds premium software synthesizers and audio effects like Diva, Zebra2, Repro, and Presswerk, celebrated for authentic analog modeling circuitry.",
    "eventide": "Eventide has been pioneering studio audio hardware and VST plugins for over 50 years, famous for Harmonizer pitch FX, Blackhole reverb, and H9 series algorithms.",
    "celemony": "Celemony is the legendary creator of Melodyne, the world standard pitch correction and note editing software for vocal tuning and musical audio manipulation.",
    "d16-group": "D16 Group produces high-end virtual instruments and audio effect plugins including drum machines, classic synth emulations, and analog-style unit processors.",
    "plugin-alliance": "Plugin Alliance brings together world-class audio brands like Brainworx, Shadow Hills, SSL, Neve, and SPL into a single unified high-fidelity audio plugin platform.",
    "meldaproduction": "MeldaProduction crafts advanced audio processing plugins with extensive modulation capabilities, pristine pitch shifting, spectral editing, and mastering tools.",
    "korg": "KORG produces legendary software synthesizers and virtual instruments replicating classic hardware synths like M1, MS-20, Wavesation, and Triton.",
    "softube": "Softube models world-class analog studio hardware from Tube-Tech, Weiss, Console 1, and SSL into ultra-accurate software mixing and mastering VST plugins.",
    "universal-audio": "Universal Audio is a world leader in audio interfaces, DSP processing, and UAD powered plugins modeling vintage Neve, Lexicon, Pultec, and Teletronix gear.",
    "sonible": "sonible develops AI-assisted smart EQ, smart:comp, and smart:reverb audio plugins designed to streamline mixing workflows with intelligent spectral balancing.",
    "heavyocity": "Heavyocity creates cinematic virtual instruments, epic orchestral sample libraries, and aggressive sound design tools for AAA game audio and film composition."
}

# Fetch all brands from Supabase API using REST API
url = "https://voalgeyexfhfitlyorfl.supabase.co/rest/v1/brands?select=id,name,slug,description"
req = urllib.request.Request(url)
req.add_header("apikey", "sb_publishable_AFTgvwUXdDPCgTny9uDIuQ_NGiDyAJD")
req.add_header("Authorization", "Bearer sb_publishable_AFTgvwUXdDPCgTny9uDIuQ_NGiDyAJD")

with urllib.request.urlopen(req) as resp:
    brands = json.loads(resp.read().decode())

print(f"Fetched {len(brands)} brands from Supabase.")

sql_statements = []

for b in brands:
    b_id = b["id"]
    name = b["name"].replace("'", "''")
    slug = b["slug"]

    if slug in CUSTOM_DESCRIPTIONS:
        desc = CUSTOM_DESCRIPTIONS[slug].replace("'", "''")
    else:
        desc = f"{name} are developers of creative audio tools, VST plugins, sample libraries, and sound design software. We are currently tying up with {name} to bring their complete catalog of products to ProducerToy. Stay tuned!".replace("'", "''")

    sql = f"UPDATE brands SET description = '{desc}' WHERE id = '{b_id}';"
    sql_statements.append(sql)

with open("update_brand_descriptions.sql", "w", encoding="utf-8") as f:
    f.write("\n".join(sql_statements))

print(f"Generated {len(sql_statements)} SQL statements in update_brand_descriptions.sql")
