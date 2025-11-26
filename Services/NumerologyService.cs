using System.Collections.Frozen;
using Furkan.Models;

namespace Furkan.Services;

public class NumerologyService
{
    // Arapça Ebced
    private static readonly FrozenDictionary<char, int> _arabicMap = new Dictionary<char, int>
    {
        ['ا'] = 1, ['أ'] = 1, ['إ'] = 1, ['آ'] = 1,
        ['ب'] = 2, ['ج'] = 3, ['د'] = 4, ['ه'] = 5, ['ة'] = 5,
        ['و'] = 6, ['ز'] = 7, ['ح'] = 8, ['ط'] = 9,
        ['ي'] = 10, ['ى'] = 10, ['ئ'] = 10,
        ['ك'] = 20, ['ک'] = 20, ['ل'] = 30, ['م'] = 40, ['ن'] = 50,
        ['س'] = 60, ['ع'] = 70, ['ف'] = 80, ['ص'] = 90,
        ['ق'] = 100, ['ر'] = 200, ['ش'] = 300, ['ت'] = 400, ['ث'] = 500,
        ['خ'] = 600, ['ذ'] = 700, ['ض'] = 800, ['ظ'] = 900, ['غ'] = 1000
    }.ToFrozenDictionary();

    // Şemsi Harfler (14 harf) - el- takısından sonra okunur
    private static readonly FrozenSet<char> _shamsiLetters = new HashSet<char>
    {
        'ت', 'ث', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ل', 'ن'
    }.ToFrozenSet();

    // Kameri Harfler (14 harf) - el- takısındaki lam okunur
    private static readonly FrozenSet<char> _qamariLetters = new HashSet<char>
    {
        'ا', 'ب', 'ج', 'ح', 'خ', 'ع', 'غ', 'ف', 'ق', 'ك', 'م', 'ه', 'و', 'ي'
    }.ToFrozenSet();

    // İbranice Gematria
    private static readonly FrozenDictionary<char, int> _hebrewMap = new Dictionary<char, int>
    {
        ['א'] = 1, ['ב'] = 2, ['ג'] = 3, ['ד'] = 4, ['ה'] = 5,
        ['ו'] = 6, ['ז'] = 7, ['ח'] = 8, ['ט'] = 9,
        ['י'] = 10, ['כ'] = 20, ['ך'] = 20, ['ל'] = 30, ['מ'] = 40, ['ם'] = 40,
        ['נ'] = 50, ['ן'] = 50, ['ס'] = 60, ['ע'] = 70, ['פ'] = 80, ['ף'] = 80,
        ['צ'] = 90, ['ץ'] = 90,
        ['ק'] = 100, ['ר'] = 200, ['ש'] = 300, ['ת'] = 400
    }.ToFrozenDictionary();

    // Yunanca Isopsephy
    private static readonly FrozenDictionary<char, int> _greekMap = new Dictionary<char, int>
    {
        // Küçük harfler
        ['α'] = 1, ['β'] = 2, ['γ'] = 3, ['δ'] = 4, ['ε'] = 5,
        ['ϛ'] = 6, ['ζ'] = 7, ['η'] = 8, ['θ'] = 9,
        ['ι'] = 10, ['κ'] = 20, ['λ'] = 30, ['μ'] = 40, ['ν'] = 50,
        ['ξ'] = 60, ['ο'] = 70, ['π'] = 80, ['ϟ'] = 90,
        ['ρ'] = 100, ['σ'] = 200, ['ς'] = 200, ['τ'] = 300, ['υ'] = 400,
        ['φ'] = 500, ['χ'] = 600, ['ψ'] = 700, ['ω'] = 800, ['ϡ'] = 900,
        // Büyük harfler
        ['Α'] = 1, ['Β'] = 2, ['Γ'] = 3, ['Δ'] = 4, ['Ε'] = 5,
        ['Ϛ'] = 6, ['Ζ'] = 7, ['Η'] = 8, ['Θ'] = 9,
        ['Ι'] = 10, ['Κ'] = 20, ['Λ'] = 30, ['Μ'] = 40, ['Ν'] = 50,
        ['Ξ'] = 60, ['Ο'] = 70, ['Π'] = 80, ['Ϟ'] = 90,
        ['Ρ'] = 100, ['Σ'] = 200, ['Τ'] = 300, ['Υ'] = 400,
        ['Φ'] = 500, ['Χ'] = 600, ['Ψ'] = 700, ['Ω'] = 800, ['Ϡ'] = 900
    }.ToFrozenDictionary();

    // Arapça harekeler (diacritics)
    private static readonly FrozenSet<char> _arabicDiacritics = CreateArabicDiacritics();
    
    private static FrozenSet<char> CreateArabicDiacritics()
    {
        var set = new HashSet<char>();
        for (int i = 0x610; i <= 0x61A; i++) set.Add((char)i);
        for (int i = 0x64B; i <= 0x65F; i++) set.Add((char)i);
        set.Add('\u0670');
        set.Add('\u0640');
        return set.ToFrozenSet();
    }

    // İbranice nikkud (sesli harf işaretleri)
    private static readonly FrozenSet<char> _hebrewDiacritics = CreateHebrewDiacritics();
    
    private static FrozenSet<char> CreateHebrewDiacritics()
    {
        var set = new HashSet<char>();
        for (int i = 0x0591; i <= 0x05C7; i++)
        {
            if (i < 0x05D0 || i > 0x05EA) set.Add((char)i);
        }
        return set.ToFrozenSet();
    }

    // Yunanca tonos işaretleri
    private static readonly FrozenSet<char> _greekDiacritics = new HashSet<char>
    {
        '\u0300', '\u0301', '\u0302', '\u0303', '\u0304', '\u0305',
        '\u0306', '\u0307', '\u0308', '\u0309', '\u030A', '\u030B',
        '\u0313', '\u0314', '\u0342', '\u0345'
    }.ToFrozenSet();

    public CalculationResult Calculate(string input, AlphabetType alphabet)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(input, nameof(input));

        var map = GetMap(alphabet);
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

        // Arapça için ek hesaplamalar
        EbcedVariations? variations = null;
        if (alphabet == AlphabetType.Arabic)
        {
            variations = CalculateArabicVariations(cleanChars, total);
        }

        return new CalculationResult(normalized, total, rows, alphabet, variations);
    }

    private EbcedVariations CalculateArabicVariations(char[] chars, int smallEbced)
    {
        // Küçük Ebced - normal hesaplama (zaten var)
        
        // Büyük Ebced - "ال" (Elif-Lam) eklenir = 1 + 30 = 31
        int bigEbced = smallEbced + 31;
        
        // En Küçük Ebced - tekrarlanan harfler bir kez sayılır
        var uniqueChars = new HashSet<char>(chars);
        int smallestEbced = 0;
        foreach (var ch in uniqueChars)
        {
            smallestEbced += _arabicMap.GetValueOrDefault(ch, 0);
        }
        
        // En Büyük Ebced - her harfin maksimum değeri (غ = 1000)
        int biggestEbced = chars.Length * 1000;
        
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

    private FrozenDictionary<char, int> GetMap(AlphabetType alphabet) => alphabet switch
    {
        AlphabetType.Arabic => _arabicMap,
        AlphabetType.Hebrew => _hebrewMap,
        AlphabetType.Greek => _greekMap,
        _ => _arabicMap
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

public enum AlphabetType
{
    Arabic,
    Hebrew,
    Greek
}

public record AlphabetInfo(string SystemName, string LanguageName, string Direction);