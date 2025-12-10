using System.Collections.Frozen;
using Furkan.Models;

namespace Furkan.Services;

public class NumerologyService
{
    // Harf bilgileri (Normal, EnKüçük, Büyük, EnBüyük)
    private readonly FrozenDictionary<char, ArabicLetterInfo> _arabicLetterInfo = new Dictionary<char, ArabicLetterInfo>
    {
        ['ا'] = new(1, 1, 111, 13),
        ['أ'] = new(1, 1, 111, 13),
        ['إ'] = new(1, 1, 111, 13),
        ['آ'] = new(1, 1, 111, 13),
        ['ء'] = new(1, 1, 111, 13),
        ['ٱ'] = new(1, 1, 111, 13),
        ['ﭐ'] = new(1, 1, 111, 13),
        ['ﭑ'] = new(1, 1, 111, 13),
        ['\u0670'] = new(1, 1, 111, 13), // Asar (Dagger Alef)
        ['\uFD3C'] = new(1, 1, 111, 13), // Alef + Fathatan Ligature (Final)
        ['\uFD3D'] = new(1, 1, 111, 13), // Alef + Fathatan Ligature (Isolated)
        ['\uFE70'] = new(1, 1, 111, 13), // Fathatan Isolated
        ['\u06EB'] = new(1, 1, 111, 13), // Hollow Damma Above (User request)
        ['\u063B'] = new(1, 1, 111, 13), // Keheh with two dots (potential variation)
        ['ب'] = new(2, 2, 3, 611),
        ['ج'] = new(3, 3, 53, 1035),
        ['د'] = new(4, 4, 35, 278),
        ['ه'] = new(5, 5, 6, 705),
        ['ة'] = new(5, 5, 6, 705),
        ['و'] = new(6, 6, 13, 465),
        ['ؤ'] = new(6, 6, 13, 465),
        ['ز'] = new(7, 7, 8, 137),
        ['ح'] = new(8, 8, 9, 606),
        ['ط'] = new(9, 9, 10, 535),
        ['ي'] = new(10, 10, 11, 575),
        ['ى'] = new(10, 10, 11, 575),
        ['ئ'] = new(10, 10, 11, 575),
        ['ك'] = new(20, 8, 101, 630),
        ['ک'] = new(20, 8, 101, 630),
        ['ل'] = new(30, 6, 71, 1090),
        ['م'] = new(40, 4, 90, 333),
        ['ن'] = new(50, 2, 106, 760),
        ['س'] = new(60, 0, 120, 520),  // Sin - yoksa 0
        ['ع'] = new(70, 10, 130, 192),
        ['ف'] = new(80, 8, 81, 651),
        ['ص'] = new(90, 6, 95, 590),
        ['ق'] = new(100, 10, 181, 651),
        ['ر'] = new(200, 8, 201, 502),
        ['ش'] = new(300, 6, 360, 1077),
        ['ت'] = new(400, 4, 401, 320),
        ['ث'] = new(500, 2, 501, 747),
        ['خ'] = new(600, 0, 601, 512),  // Ha - yoksa 0
        ['ذ'] = new(700, 10, 701, 179),
        ['ض'] = new(800, 8, 805, 653),
        ['ظ'] = new(900, 6, 901, 577),
        ['غ'] = new(1000, 10, 1060, 111)
    }.ToFrozenDictionary();

    // Eski map sadece normal değerler için (geriye uyumluluk)
    private FrozenDictionary<char, int> GetArabicNormalMap()
    {
        return _arabicLetterInfo.ToFrozenDictionary(
            kvp => kvp.Key,
            kvp => kvp.Value.Normal
        );
    }

    // Şemsi Harfler (14 harf)
    private readonly FrozenSet<char> _shamsiLetters = new HashSet<char>
    {
        'ت', 'ث', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ل', 'ن'
    }.ToFrozenSet();

    // Kameri Harfler (14 harf)
    private readonly FrozenSet<char> _qamariLetters = new HashSet<char>
    {
        'ا', 'ب', 'ج', 'ح', 'خ', 'ع', 'غ', 'ف', 'ق', 'ك', 'م', 'ه', 'و', 'ي'
    }.ToFrozenSet();

    // İbranice Gematria
    private readonly FrozenDictionary<char, int> _hebrewMap = new Dictionary<char, int>
    {
        ['א'] = 1, ['ב'] = 2, ['ג'] = 3, ['ד'] = 4, ['ה'] = 5,
        ['ו'] = 6, ['ז'] = 7, ['ח'] = 8, ['ט'] = 9,
        ['י'] = 10, ['כ'] = 20, ['ך'] = 20, ['ל'] = 30, ['מ'] = 40, ['ם'] = 40,
        ['נ'] = 50, ['ן'] = 50, ['ס'] = 60, ['ע'] = 70, ['פ'] = 80, ['ף'] = 80,
        ['צ'] = 90, ['ץ'] = 90,
        ['ק'] = 100, ['ר'] = 200, ['ש'] = 300, ['ת'] = 400
    }.ToFrozenDictionary();

    // Yunanca Isopsephy
    private readonly FrozenDictionary<char, int> _greekMap = new Dictionary<char, int>
    {
        ['α'] = 1, ['β'] = 2, ['γ'] = 3, ['δ'] = 4, ['ε'] = 5,
        ['ϛ'] = 6, ['ζ'] = 7, ['η'] = 8, ['θ'] = 9,
        ['ι'] = 10, ['κ'] = 20, ['λ'] = 30, ['μ'] = 40, ['ν'] = 50,
        ['ξ'] = 60, ['ο'] = 70, ['π'] = 80, ['ϟ'] = 90,
        ['ρ'] = 100, ['σ'] = 200, ['ς'] = 200, ['τ'] = 300, ['υ'] = 400,
        ['φ'] = 500, ['χ'] = 600, ['ψ'] = 700, ['ω'] = 800, ['ϡ'] = 900,
        ['Α'] = 1, ['Β'] = 2, ['Γ'] = 3, ['Δ'] = 4, ['Ε'] = 5,
        ['Ϛ'] = 6, ['Ζ'] = 7, ['Η'] = 8, ['Θ'] = 9,
        ['Ι'] = 10, ['Κ'] = 20, ['Λ'] = 30, ['Μ'] = 40, ['Ν'] = 50,
        ['Ξ'] = 60, ['Ο'] = 70, ['Π'] = 80, ['Ϟ'] = 90,
        ['Ρ'] = 100, ['Σ'] = 200, ['Τ'] = 300, ['Υ'] = 400,
        ['Φ'] = 500, ['Χ'] = 600, ['Ψ'] = 700, ['Ω'] = 800, ['Ϡ'] = 900
    }.ToFrozenDictionary();

    private readonly FrozenSet<char> _arabicDiacritics = CreateArabicDiacritics();
    
    private static FrozenSet<char> CreateArabicDiacritics()
    {
        var set = new HashSet<char>();
        for (int i = 0x610; i <= 0x61A; i++) set.Add((char)i);
        for (int i = 0x64B; i <= 0x65F; i++) set.Add((char)i);
        set.Add('\u0640');
        set.Add('\u0656');
        set.Add('\u0654');
        return set.ToFrozenSet();
    }

    private readonly FrozenSet<char> _hebrewDiacritics = CreateHebrewDiacritics();
    
    private static FrozenSet<char> CreateHebrewDiacritics()
    {
        var set = new HashSet<char>();
        for (int i = 0x0591; i <= 0x05C7; i++)
        {
            if (i < 0x05D0 || i > 0x05EA) set.Add((char)i);
        }
        return set.ToFrozenSet();
    }

    private readonly FrozenSet<char> _greekDiacritics = new HashSet<char>
    {
        '\u0300', '\u0301', '\u0302', '\u0303', '\u0304', '\u0305',
        '\u0306', '\u0307', '\u0308', '\u0309', '\u030A', '\u030B',
        '\u0313', '\u0314', '\u0342', '\u0345'
    }.ToFrozenSet();

    public CalculationResult Calculate(string input, AlphabetType alphabet, CalculationType type = CalculationType.Normal)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(input, nameof(input));

        var map = GetMap(alphabet, type);
        var diacritics = GetDiacritics(alphabet);

        var cleanChars = input
            .Where(ch => !diacritics.Contains(ch) && !char.IsWhiteSpace(ch))
            .ToArray();

        if (cleanChars.Length == 0)
        {
            return new CalculationResult("", 0, new List<LetterRow>(), alphabet, null);
        }

        var normalized = new string(cleanChars);
        var rows = new List<LetterRow>(cleanChars.Length);
        int total = 0;

        foreach (var ch in cleanChars)
        {
            int value = map.GetValueOrDefault(ch, 0);
            rows.Add(new LetterRow(ch.ToString(), value));
            total += value;
        }

        EbcedVariations? variations = null;
        if (alphabet == AlphabetType.Arabic)
        {
            variations = CalculateArabicVariations(cleanChars);
        }

        return new CalculationResult(normalized, total, rows, alphabet, variations);
    }

    private EbcedVariations CalculateArabicVariations(char[] chars)
    {
        int smallEbced = 0;      // Küçük-Asıl Ebced
        int smallestEbced = 0;   // En Küçük Ebced
        int bigEbced = 0;        // Büyük Ebced
        int biggestEbced = 0;    // En Büyük Ebced
        
        foreach (var ch in chars)
        {
            if (_arabicLetterInfo.TryGetValue(ch, out var info))
            {
                smallEbced += info.Normal;
                smallestEbced += info.Smallest;
                bigEbced += info.Big;
                biggestEbced += info.Biggest;
            }
        }
        
        // Şemsi ve Kameri sayıları
        int shamsiCount = 0;
        int qamariCount = 0;
        foreach (var ch in chars)
        {
            if (_shamsiLetters.Contains(ch)) shamsiCount++;
            if (_qamariLetters.Contains(ch)) qamariCount++;
        }

        return new EbcedVariations(
            smallEbced,
            bigEbced,
            smallestEbced,
            biggestEbced,
            shamsiCount,
            qamariCount
        );
    }

    public int CalculateTotal(string input, AlphabetType alphabet)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(input, nameof(input));

        var map = GetMap(alphabet);
        var diacritics = GetDiacritics(alphabet);

        int total = 0;
        foreach (var ch in input)
        {
            if (!diacritics.Contains(ch) && !char.IsWhiteSpace(ch))
            {
                total += map.GetValueOrDefault(ch, 0);
            }
        }
        return total;
    }

    private FrozenDictionary<char, int> GetMap(AlphabetType alphabet, CalculationType type = CalculationType.Normal) => alphabet switch
    {
        AlphabetType.Arabic => type switch 
        {
            CalculationType.Smallest => _arabicLetterInfo.ToFrozenDictionary(k => k.Key, v => v.Value.Smallest),
            CalculationType.Big => _arabicLetterInfo.ToFrozenDictionary(k => k.Key, v => v.Value.Big),
            CalculationType.Biggest => _arabicLetterInfo.ToFrozenDictionary(k => k.Key, v => v.Value.Biggest),
            _ => GetArabicNormalMap()
        },
        AlphabetType.Hebrew => _hebrewMap,
        AlphabetType.Greek => _greekMap,
        _ => GetArabicNormalMap()
    };

    private FrozenSet<char> GetDiacritics(AlphabetType alphabet) => alphabet switch
    {
        AlphabetType.Arabic => _arabicDiacritics,
        AlphabetType.Hebrew => _hebrewDiacritics,
        AlphabetType.Greek => _greekDiacritics,
        _ => _arabicDiacritics
    };

    public static AlphabetInfo GetAlphabetInfo(AlphabetType alphabet) => alphabet switch
    {
        AlphabetType.Arabic => new AlphabetInfo("Ebced", "Arapça", "rtl"),
        AlphabetType.Hebrew => new AlphabetInfo("Gematria", "İbranice", "rtl"),
        AlphabetType.Greek => new AlphabetInfo("Isopsephy", "Yunanca", "ltr"),
        _ => new AlphabetInfo("Ebced", "Arapça", "rtl")
    };
}

// Arapça harf bilgisi
public record ArabicLetterInfo(int Normal, int Smallest, int Big, int Biggest);

public enum AlphabetType
{
    Arabic,
    Hebrew,
    Greek
}

public record AlphabetInfo(string SystemName, string LanguageName, string Direction);

public enum CalculationType
{
    Normal,
    Smallest,
    Big,
    Biggest
}