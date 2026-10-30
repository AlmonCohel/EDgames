/* Every line the site says out loud, in both languages — the single source for
   the recordings in assets/voice/<lang>/<key>.mp3 (made by
   scripts/make-voice.mjs) and for the browser-speech fallback in voice.js.

   Keys are file names, so they stay [a-z0-9-]. Sentences that end in a letter,
   a number or a colour are recorded as an opening line plus that word, and
   played back to back (`EDVoice.say(['listen-find', 'letter-bet'])`), so a
   new letter or number never needs a new sentence.

   Hebrew letter names carry niqqud so the Hebrew voice says בֵּית, not "bayit". */

(function () {
  const HE_LETTERS = {
    'א': ['alef', 'אָלֶף'], 'ב': ['bet', 'בֵּית'], 'ג': ['gimel', 'גִּימֶל'], 'ד': ['dalet', 'דָּלֶת'],
    'ה': ['he', 'הֵא'], 'ו': ['vav', 'וָו'], 'ז': ['zayin', 'זַיִן'], 'ח': ['het', 'חֵית'],
    'ט': ['tet', 'טֵית'], 'י': ['yud', 'יוּד'], 'כ': ['kaf', 'כַּף'], 'ל': ['lamed', 'לָמֶד'],
    'מ': ['mem', 'מֵם'], 'נ': ['nun', 'נוּן'], 'ס': ['samekh', 'סָמֶךְ'], 'ע': ['ayin', 'עַיִן'],
    'פ': ['pe', 'פֵּא'], 'צ': ['tsadi', 'צָדִי'], 'ק': ['kuf', 'קוּף'], 'ר': ['resh', 'רֵישׁ'],
    'ש': ['shin', 'שִׁין'], 'ת': ['tav', 'תָּו'],
    'ך': ['kaf-sofit', 'כַּף סוֹפִית'], 'ם': ['mem-sofit', 'מֵם סוֹפִית'], 'ן': ['nun-sofit', 'נוּן סוֹפִית'],
    'ף': ['pe-sofit', 'פֵּא סוֹפִית'], 'ץ': ['tsadi-sofit', 'צָדִי סוֹפִית'],
  };
  /* Said the way the letter is named, not the way it sounds in a word. */
  const EN_LETTERS = {
    A: 'ay', B: 'bee', C: 'see', D: 'dee', E: 'ee', F: 'eff', G: 'jee', H: 'aitch', I: 'eye',
    J: 'jay', K: 'kay', L: 'ell', M: 'em', N: 'en', O: 'oh', P: 'pee', Q: 'cue', R: 'are',
    S: 'ess', T: 'tee', U: 'you', V: 'vee', W: 'double you', X: 'ex', Y: 'why', Z: 'zee',
  };
  const HE_NUM = ['אֶפֶס', 'אַחַת', 'שְׁתַּיִם', 'שָׁלוֹשׁ', 'אַרְבַּע', 'חָמֵשׁ', 'שֵׁשׁ', 'שֶׁבַע', 'שְׁמוֹנֶה', 'תֵּשַׁע', 'עֶשֶׂר',
    'אַחַת עֶשְׂרֵה', 'שְׁתֵּים עֶשְׂרֵה', 'שְׁלוֹשׁ עֶשְׂרֵה', 'אַרְבַּע עֶשְׂרֵה', 'חֲמֵשׁ עֶשְׂרֵה', 'שֵׁשׁ עֶשְׂרֵה', 'שְׁבַע עֶשְׂרֵה', 'שְׁמוֹנֶה עֶשְׂרֵה', 'תְּשַׁע עֶשְׂרֵה', 'עֶשְׂרִים'];
  const EN_NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];

  const he = {
    'praise-1': 'כָּל הַכָּבוֹד!', 'praise-2': 'יֹפִי!', 'praise-3': 'מְצֻיָּן!', 'praise-4': 'נֶהֱדָר!',
    'try-again': 'כִּמְעַט! נְנַסֶּה שׁוּב',
    'step-done': 'כָּל הַכָּבוֹד! סִיַּמְתֶּם אֶת הַשָּׁלָב!',

    'trace-ask': 'כּוֹתְבִים אֶת הָאוֹת',

    'animals-ask': 'מִי עוֹשֶׂה אֶת הַקּוֹל הַזֶּה?',
    'animal-cow': 'פָּרָה', 'animal-sheep': 'כִּבְשָׂה', 'animal-horse': 'סוּס', 'animal-hen': 'תַּרְנְגֹלֶת',
    'animal-duck': 'בַּרְוָז', 'animal-pig': 'חֲזִיר', 'animal-cat': 'חָתוּל', 'animal-dog': 'כֶּלֶב',
    'animal-bird': 'צִפּוֹר', 'animal-frog': 'צְפַרְדֵּעַ', 'animal-bee': 'דְּבוֹרָה', 'animal-lion': 'אַרְיֵה',

    'candles-1': 'שִׂימוּ נֵר אֶחָד עַל הָעוּגָה', 'candles-2': 'שִׂימוּ שְׁנֵי נֵרוֹת עַל הָעוּגָה',
    'candles-3': 'שִׂימוּ שְׁלוֹשָׁה נֵרוֹת עַל הָעוּגָה', 'candles-4': 'שִׂימוּ אַרְבָּעָה נֵרוֹת עַל הָעוּגָה',
    'candles-5': 'שִׂימוּ חֲמִשָּׁה נֵרוֹת עַל הָעוּגָה', 'candles-6': 'שִׂימוּ שִׁשָּׁה נֵרוֹת עַל הָעוּגָה',
    'candles-7': 'שִׂימוּ שִׁבְעָה נֵרוֹת עַל הָעוּגָה', 'candles-8': 'שִׂימוּ שְׁמוֹנָה נֵרוֹת עַל הָעוּגָה',
    'candles-9': 'שִׂימוּ תִּשְׁעָה נֵרוֹת עַל הָעוּגָה', 'candles-10': 'שִׂימוּ עֲשָׂרָה נֵרוֹת עַל הָעוּגָה',
    'candles-more': 'צָרִיךְ עוֹד נֵרוֹת!',
    'candles-less': 'יֵשׁ יוֹתֵר מִדַּי נֵרוֹת. לוֹחֲצִים עַל נֵר כְּדֵי לְהוֹרִיד אוֹתוֹ',
    'candles-blow': 'יוֹם הֻלֶּדֶת שָׂמֵחַ! עַכְשָׁו מְכַבִּים אֶת הַנֵּרוֹת. לוֹחֲצִים עַל כָּל לֶהָבָה',

    'hop-to': 'קוֹפְצִים לֶעָלֶה מִסְפָּר',

    'more-ask': 'בְּאֵיזֶה סַל יֵשׁ יוֹתֵר פֵּרוֹת?',
    'less-ask': 'בְּאֵיזֶה סַל יֵשׁ פָּחוֹת פֵּרוֹת?',
    'match-ask': 'בְּאֵיזֶה סַל יֵשׁ בְּדִיּוּק',

    'dress-pink': 'הַנְּסִיכָה רוֹצָה שִׂמְלָה וְרֻדָּה', 'dress-purple': 'הַנְּסִיכָה רוֹצָה שִׂמְלָה סְגֻלָּה',
    'dress-blue': 'הַנְּסִיכָה רוֹצָה שִׂמְלָה כְּחֻלָּה', 'dress-yellow': 'הַנְּסִיכָה רוֹצָה שִׂמְלָה צְהֻבָּה',
    'dress-green': 'הַנְּסִיכָה רוֹצָה שִׂמְלָה יְרֻקָּה', 'dress-red': 'הַנְּסִיכָה רוֹצָה שִׂמְלָה אֲדֻמָּה',
    'gem-pink': 'וְעַכְשָׁו כֶּתֶר עִם אֶבֶן וְרֻדָּה', 'gem-purple': 'וְעַכְשָׁו כֶּתֶר עִם אֶבֶן סְגֻלָּה',
    'gem-blue': 'וְעַכְשָׁו כֶּתֶר עִם אֶבֶן כְּחֻלָּה', 'gem-yellow': 'וְעַכְשָׁו כֶּתֶר עִם אֶבֶן צְהֻבָּה',
    'gem-green': 'וְעַכְשָׁו כֶּתֶר עִם אֶבֶן יְרֻקָּה', 'gem-red': 'וְעַכְשָׁו כֶּתֶר עִם אֶבֶן אֲדֻמָּה',
    'shoes-pink': 'וּנְעָלַיִם וְרֻדּוֹת', 'shoes-purple': 'וּנְעָלַיִם סְגֻלּוֹת', 'shoes-blue': 'וּנְעָלַיִם כְּחֻלּוֹת',
    'shoes-yellow': 'וּנְעָלַיִם צְהֻבּוֹת', 'shoes-green': 'וּנְעָלַיִם יְרֻקּוֹת', 'shoes-red': 'וּנְעָלַיִם אֲדֻמּוֹת',
    'dress-ready': 'הַנְּסִיכָה מוּכָנָה לַנֶּשֶׁף! אֵיזֶה יֹפִי!',

    'color-red': 'אָדֹם', 'color-orange': 'כָּתֹם', 'color-yellow': 'צָהֹב', 'color-green': 'יָרֹק',
    'color-blue': 'כָּחֹל', 'color-purple': 'סָגֹל', 'color-pink': 'וָרֹד',
    'rainbow-ask': 'צוֹבְעִים אֶת הַקֶּשֶׁת בְּדִיּוּק כְּמוֹ בַּתְּמוּנָה הַקְּטַנָּה',
    'rainbow-go': 'הַקֶּשֶׁת מוּכָנָה! חַד הַקֶּרֶן יוֹצֵא לַדֶּרֶךְ!',
    'pattern-ask': 'מָה בָּא עַכְשָׁו בַּשְּׁבִיל שֶׁל חַד הַקֶּרֶן?',

    'shadow-ask': 'שֶׁל מִי הַצֵּל בַּמַּרְאָה הַקְּסוּמָה?',
    'item-crown': 'כֶּתֶר', 'item-princess': 'נְסִיכָה', 'item-prince': 'נָסִיךְ', 'item-unicorn': 'חַד קֶרֶן',
    'item-dragon': 'דְּרָקוֹן', 'item-castle': 'טִירָה', 'item-frog': 'צְפַרְדֵּעַ', 'item-shoe': 'נַעַל',
    'item-ring': 'טַבַּעַת', 'item-pumpkin': 'דְּלַעַת', 'item-fairy': 'פֵיָה', 'item-swan': 'בַּרְבּוּר',
    'item-key': 'מַפְתֵּחַ', 'item-gem': 'יַהֲלוֹם', 'item-horse': 'סוּס', 'item-apple': 'תַּפּוּחַ',
    'item-rose': 'וֶרֶד', 'item-mermaid': 'בַּת יָם',

    'build-ask': 'אֵיזוֹ צוּרָה מַתְאִימָה לַמָּקוֹם שֶׁמְּנַצְנֵץ?',
    'build-done': 'הַטִּירָה מוּכָנָה! הַנְּסִיכָה עוֹבֶרֶת לָגוּר בָּהּ!',
    'shape-square': 'רִבּוּעַ', 'shape-rect': 'מַלְבֵּן', 'shape-triangle': 'מְשֻׁלָּשׁ', 'shape-circle': 'עִגּוּל', 'shape-arch': 'קֶשֶׁת',

    'listen-find': 'מִצְאוּ אֶת הָאוֹת',
    'balloons-pop': 'מְפוֹצְצִים אֶת כָּל הַבָּלוֹנִים עִם הָאוֹת',
    'dots-ask': 'מְחַבְּרִים אֶת הַנְּקֻדּוֹת לְפִי הָאָלֶף בֵּית. מַתְחִילִים מֵאָלֶף!',
    'dots-look': 'מְחַפְּשִׂים אֶת',
    'dots-wow': 'וָאוּ! יָצָא',
    'pic-star': 'כּוֹכָב', 'pic-heart': 'לֵב', 'pic-house': 'בַּיִת', 'pic-fish': 'דָּג', 'pic-boat': 'סִירָה', 'pic-kite': 'עֲפִיפוֹן', 'pic-crown': 'כֶּתֶר', 'pic-tree': 'עֵץ',

    'bigsmall-ask': 'מִצְאוּ אֶת הָאוֹת הַקְּטַנָּה שֶׁל',
    'cat-ask': 'אֵיזוֹ אוֹת חֲסֵרָה בַּזַּחַל?',

    'bubbles-ask': 'מְפוֹצְצִים אֶת הַבּוּעוֹת לְפִי הַסֵּדֶר',
    'bubbles-back': 'סוֹפְרִים אָחוֹרָה וּמְפוֹצְצִים',
    'odd-ask': 'מִי לֹא שַׁיָּךְ?',
    'sort-ask': 'לְאֵיזֶה סַל זֶה הוֹלֵךְ?',

    'pizza-ask': 'הַזְמָנָה חֲדָשָׁה:',
    'pizza-more': 'חָסֵר עוֹד מַשֶּׁהוּ בַּפִּיצָה',
    'pizza-less': 'יֵשׁ יוֹתֵר מִדַּי. לוֹחֲצִים עַל תּוֹסֶפֶת כְּדֵי לְהוֹרִיד אוֹתָהּ',
    'pizza-yum': 'תּוֹדָה! אֵיזוֹ פִּיצָה טְעִימָה!',
    'robot-ask': 'בּוֹנִים דֶּרֶךְ לַסּוֹלְלָה בְּחִצִּים, וְאָז מַפְעִילִים',
    'robot-bump': 'אוֹי! הָרוֹבּוֹט לֹא הִגִּיעַ. מְתַקְּנִים אֶת הַתָּכְנִית וּמְנַסִּים שׁוּב',
    'robot-win': 'הִצְלַחְתֶּם! הָרוֹבּוֹט מָצָא אֶת הַסּוֹלְלָה!',
    'lab-ask': 'מְעַרְבְּבִים שְׁנֵי צְבָעִים כְּדֵי לְקַבֵּל',
    'lab-oops': 'יָצָא צֶבַע אַחֵר. מְנַסִּים שְׁנֵי צְבָעִים אֲחֵרִים',
    'color-lightblue': 'תְּכֵלֶת', 'color-gray': 'אָפֹר',

    'words-ask': 'מַקְשִׁיבִים וּמוֹצְאִים אֶת הַתְּמוּנָה',
    'ten-ask-5': 'כַּמָּה עוֹד צָרִיךְ כְּדֵי לְהַגִּיעַ לְחָמֵשׁ?',
    'ten-ask-10': 'כַּמָּה עוֹד צָרִיךְ כְּדֵי לְהַגִּיעַ לְעֶשֶׂר?',
    'ten-sum': 'כַּמָּה זֶה בְּיַחַד?',
    'next-ask': 'מָה בָּא עַכְשָׁו?',
    'next-num': 'מָה הַמִּסְפָּר הַבָּא?',
    'next-board': 'מָה חָסֵר בַּמִּשְׁבֶּצֶת?',
  };

  /* A pizza order, spelled out because Hebrew numbers change with what they count. */
  const HE_ORDER = {
    mushroom: ['פִּטְרִיָּה אַחַת', 'פִּטְרִיּוֹת'],
    tomato: ['עַגְבָנִיָּה אַחַת', 'עַגְבָנִיּוֹת'],
    cheese: ['חֲתִיכַת גְּבִינָה אַחַת', 'חֲתִיכוֹת גְּבִינָה'],
  };
  const HE_F = { 2: 'שְׁתֵּי', 3: 'שָׁלוֹשׁ', 4: 'אַרְבַּע', 5: 'חָמֵשׁ' };
  Object.entries(HE_ORDER).forEach(([k, [one, many]]) => {
    he[`pizza-${k}-1`] = one;
    Object.entries(HE_F).forEach(([n, w]) => { he[`pizza-${k}-${n}`] = `${w} ${many}`; });
  });

  const en = {
    'praise-1': 'Well done!', 'praise-2': 'Great job!', 'praise-3': 'Excellent!', 'praise-4': 'Wonderful!',
    'try-again': "Almost! Let's try again",
    'step-done': 'Well done! You finished this step!',

    'trace-ask': 'Write the letter',
    'trace-ask-small': 'Write the small letter',

    'animals-ask': 'Who makes this sound?',
    'animal-cow': 'A cow', 'animal-sheep': 'A sheep', 'animal-horse': 'A horse', 'animal-hen': 'A hen',
    'animal-duck': 'A duck', 'animal-pig': 'A pig', 'animal-cat': 'A cat', 'animal-dog': 'A dog',
    'animal-bird': 'A bird', 'animal-frog': 'A frog', 'animal-bee': 'A bee', 'animal-lion': 'A lion',

    'candles-1': 'Put one candle on the cake',
    'candles-more': 'We need more candles!',
    'candles-less': 'Too many candles. Tap a candle to take it off',
    'candles-blow': 'Happy birthday! Now blow out the candles. Tap every flame',

    'hop-to': 'Hop to lily pad number',

    'more-ask': 'Which basket has more fruit?',
    'less-ask': 'Which basket has less fruit?',
    'match-ask': 'Which basket has exactly',

    'dress-ready': 'The princess is ready for the ball! How beautiful!',
    'rainbow-ask': 'Paint the rainbow just like the little picture',
    'rainbow-go': 'The rainbow is ready! Off goes the unicorn!',
    'pattern-ask': "What comes next on the unicorn's path?",

    'shadow-ask': 'Whose shadow is in the magic mirror?',
    'item-crown': 'A crown', 'item-princess': 'A princess', 'item-prince': 'A prince', 'item-unicorn': 'A unicorn',
    'item-dragon': 'A dragon', 'item-castle': 'A castle', 'item-frog': 'A frog', 'item-shoe': 'A shoe',
    'item-ring': 'A ring', 'item-pumpkin': 'A pumpkin', 'item-fairy': 'A fairy', 'item-swan': 'A swan',
    'item-key': 'A key', 'item-gem': 'A jewel', 'item-horse': 'A horse', 'item-apple': 'An apple',
    'item-rose': 'A rose', 'item-mermaid': 'A mermaid',

    'build-ask': 'Which shape fits the sparkling spot?',
    'build-done': 'The castle is ready! The princess is moving in!',
    'shape-square': 'Square', 'shape-rect': 'Rectangle', 'shape-triangle': 'Triangle', 'shape-circle': 'Circle', 'shape-arch': 'Arch',

    'listen-find': 'Where is the letter',
    'balloons-pop': 'Pop all the balloons with the letter',
    'dots-ask': 'Join the dots in Alef-Bet order. Start with Alef!',
    'dots-ask-en': 'Join the dots in A B C order. Start with A!',
    'dots-look': 'Look for',
    'dots-wow': "Wow! It's a",
    'pic-star': 'star', 'pic-heart': 'heart', 'pic-house': 'house', 'pic-fish': 'fish', 'pic-boat': 'boat', 'pic-kite': 'kite', 'pic-crown': 'crown', 'pic-tree': 'tree',

    'bigsmall-ask': 'Find the small letter for',
    'cat-ask': 'Which letter is missing from the caterpillar?',

    'bubbles-ask': 'Pop the bubbles in order',
    'bubbles-back': 'Count backwards and pop',
    'odd-ask': 'Who does not belong?',
    'sort-ask': 'Which basket does it go in?',

    'pizza-ask': 'A new order:',
    'pizza-more': 'Something is still missing from the pizza',
    'pizza-less': 'Too many. Tap a topping to take it off',
    'pizza-yum': 'Thank you! What a tasty pizza!',
    'robot-ask': 'Plan a way to the battery with the arrows, then run it',
    'robot-bump': 'Oh! The robot did not get there. Fix the plan and try again',
    'robot-win': 'You did it! The robot found the battery!',
    'lab-ask': 'Mix two colours to make',
    'lab-oops': 'That made another colour. Try two different ones',
    'color-lightblue': 'Light blue', 'color-gray': 'Grey',

    'words-ask': 'Listen and find the picture',
    'ten-ask-5': 'How many more to make five?',
    'ten-ask-10': 'How many more to make ten?',
    'ten-sum': 'How many altogether?',
    'next-ask': 'What comes next?',
    'next-num': 'What is the next number?',
    'next-board': 'What is missing from the square?',
  };

  /* English words are said in English, on the Hebrew page too. */
  ['dog', 'cat', 'fish', 'bird', 'horse', 'cow', 'duck', 'frog',
    'apple', 'banana', 'bread', 'milk', 'egg', 'cake', 'cheese', 'water',
    'ball', 'book', 'car', 'house', 'tree', 'sun', 'star', 'key'].forEach((w) => { en[`word-${w}`] = w; });

  const EN_ORDER = {
    mushroom: ['mushroom', 'mushrooms'],
    tomato: ['tomato', 'tomatoes'],
    cheese: ['piece of cheese', 'pieces of cheese'],
  };
  Object.entries(EN_ORDER).forEach(([k, [one, many]]) => {
    for (let n = 1; n <= 5; n += 1) en[`pizza-${k}-${n}`] = `${EN_NUM[n]} ${n === 1 ? one : many}`;
  });

  const COLOURS = { pink: 'pink', purple: 'purple', blue: 'blue', yellow: 'yellow', green: 'green', red: 'red', orange: 'orange' };
  Object.keys(COLOURS).forEach((c) => {
    en[`color-${c}`] = c[0].toUpperCase() + c.slice(1);
    if (c === 'orange') return;
    en[`dress-${c}`] = `The princess wants a ${c} dress`;
    en[`gem-${c}`] = `Now a crown with a ${c} jewel`;
    en[`shoes-${c}`] = `And ${c} shoes`;
  });
  for (let n = 2; n <= 10; n += 1) en[`candles-${n}`] = `Put ${EN_NUM[n]} candles on the cake`;

  const heLetterKey = {};
  Object.entries(HE_LETTERS).forEach(([ch, [key, name]]) => { heLetterKey[ch] = `letter-${key}`; he[`letter-${key}`] = name; });
  const enLetterKey = {};
  Object.entries(EN_LETTERS).forEach(([ch, name]) => {
    enLetterKey[ch] = `letter-${ch.toLowerCase()}`;
    enLetterKey[ch.toLowerCase()] = `letter-${ch.toLowerCase()}`;
    en[`letter-${ch.toLowerCase()}`] = name;
  });
  HE_NUM.forEach((w, n) => { he[`num-${n}`] = w; });
  EN_NUM.forEach((w, n) => { en[`num-${n}`] = w; });

  /* The key for a letter: Hebrew letters are said in Hebrew and Latin ones in
     English, whatever language the page is in — the letter decides. */
  function letter(ch) {
    if (heLetterKey[ch]) return { key: heLetterKey[ch], lang: 'he' };
    if (enLetterKey[ch]) return { key: enLetterKey[ch], lang: 'en' };
    return null;
  }

  const lines = { he, en, letter, num: (n) => `num-${n}` };
  if (typeof window !== 'undefined') window.EDVoiceLines = lines;
  if (typeof module !== 'undefined') module.exports = lines;
})();
