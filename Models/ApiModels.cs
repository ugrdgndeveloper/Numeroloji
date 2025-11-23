using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Furkan.Services;

namespace Furkan.Models;

// Request Model
public record CalculationRequest(
    [Required(ErrorMessage = "Metin gereklidir")]
    string Text,
    AlphabetType Alphabet = AlphabetType.Arabic
);

// Response Models
public record CalculationResult(
    string Normalized,
    int Total,
    List<LetterRow> Rows,
    AlphabetType Alphabet
);

public record LetterRow(
    string Char,
    int Value
);

public record ErrorResponse(string Message);

// Eski modellerle uyumluluk için
public record EbcedRequest([Required] string Text);
public record EbcedResult(string Normalized, int Total, List<EbcedRow> Rows);
public record EbcedRow(string Char, int Value);

// JSON Serialization Context
[JsonSerializable(typeof(CalculationRequest))]
[JsonSerializable(typeof(CalculationResult))]
[JsonSerializable(typeof(LetterRow))]
[JsonSerializable(typeof(List<LetterRow>))]
[JsonSerializable(typeof(EbcedRequest))]
[JsonSerializable(typeof(EbcedResult))]
[JsonSerializable(typeof(EbcedRow))]
[JsonSerializable(typeof(List<EbcedRow>))]
[JsonSerializable(typeof(ErrorResponse))]
[JsonSerializable(typeof(AlphabetType))]
internal partial class AppJsonSerializerContext : JsonSerializerContext
{
}