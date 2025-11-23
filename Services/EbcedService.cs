using System.Collections.Frozen;
using Furkan.Models;

namespace Furkan.Services;

public class EbcedService
{
    private static readonly FrozenDictionary<char, int> _ebcedMap = new Dictionary<char, int>
    {
        // Alef variations
        ['ا'] = 1, ['أ'] = 1, ['إ'] = 1, ['آ'] = 1,
        
        // Basic letters
        ['ب'] = 2, ['ج'] = 3, ['د'] = 4, ['ه'] = 5, ['ة'] = 5, 
        ['و'] = 6, ['ز'] = 7, ['ح'] = 8, ['ط'] = 9,
        
        // Tens
        ['ي'] = 10, ['ى'] = 10, ['ئ'] = 10, 
        ['ك'] = 20, ['ک'] = 20, 
        ['ل'] = 30, 
        ['م'] = 40, 
        ['ن'] = 50,
        ['س'] = 60, 
        ['ع'] = 70, 
        ['ف'] = 80, 
        ['ص'] = 90,
        
        // Hundreds
        ['ق'] = 100, 
        ['ر'] = 200, 
        ['ش'] = 300, 
        ['ت'] = 400, 
        ['ث'] = 500,
        ['خ'] = 600, 
        ['ذ'] = 700, 
        ['ض'] = 800, 
        ['ظ'] = 900, 
        ['غ'] = 1000
    }.ToFrozenDictionary();

    private static readonly FrozenSet<char> _diacritics = InitializeDiacritics();

    private static FrozenSet<char> InitializeDiacritics()
    {
        var set = new HashSet<char>();
        
        // Arabic diacritical marks (U+0610 to U+061A)
        for (int i = 0x610; i <= 0x61A; i++)
            set.Add((char)i);
        
        // Arabic diacritical marks (U+064B to U+065F)
        for (int i = 0x64B; i <= 0x65F; i++)
            set.Add((char)i);
        
        // Arabic letter superscript Alef (U+0670)
        set.Add('\u0670');
        
        // Tatweel (Arabic kashida)
        set.Add('\u0640');
        
        return set.ToFrozenSet();
    }

    private static bool IsDiacritic(char ch) => _diacritics.Contains(ch);

    /// <summary>
    /// Calculates the Ebced (Abjad) value of the given Arabic text
    /// </summary>
    public EbcedResult Calculate(string input)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(input, nameof(input));

        // Filter out diacritics and spaces
        var cleanChars = input
            .Where(ch => !IsDiacritic(ch) && !char.IsWhiteSpace(ch))
            .ToArray();

        if (cleanChars.Length == 0)
        {
            return new EbcedResult("", 0, new List<EbcedRow>());
        }

        var normalized = new string(cleanChars);
        var rows = new List<EbcedRow>(cleanChars.Length);
        int total = 0;

        foreach (var ch in cleanChars)
        {
            int value = _ebcedMap.GetValueOrDefault(ch, 0);
            rows.Add(new EbcedRow(ch.ToString(), value));
            total += value;
        }

        return new EbcedResult(normalized, total, rows);
    }

    /// <summary>
    /// Calculates only the total Ebced value (faster, no detailed breakdown)
    /// </summary>
    public int CalculateTotal(string input)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(input, nameof(input));

        int total = 0;
        foreach (var ch in input)
        {
            if (!IsDiacritic(ch) && !char.IsWhiteSpace(ch))
            {
                total += _ebcedMap.GetValueOrDefault(ch, 0);
            }
        }
        return total;
    }

    /// <summary>
    /// Returns normalized text (removes diacritics and spaces)
    /// </summary>
    public string Normalize(string input)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(input, nameof(input));

        var cleanChars = input
            .Where(ch => !IsDiacritic(ch) && !char.IsWhiteSpace(ch))
            .ToArray();

        return new string(cleanChars);
    }
}