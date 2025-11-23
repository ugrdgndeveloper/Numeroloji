using Furkan.Models;
using Furkan.Services;
using Microsoft.AspNetCore.Http.HttpResults;

var builder = WebApplication.CreateSlimBuilder(args);

// Configure JSON options
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.TypeInfoResolverChain.Insert(0, AppJsonSerializerContext.Default);
    options.SerializerOptions.PropertyNamingPolicy = null;
});

// Add services
builder.Services.AddRazorPages();
builder.Services.AddSingleton<EbcedService>();
builder.Services.AddSingleton<NumerologyService>();

var app = builder.Build();

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.MapRazorPages();

// Eski Ebced API (geriye uyumluluk)
var ebcedApi = app.MapGroup("/api/ebced")
    .WithTags("Ebced Calculator");

ebcedApi.MapPost("/", Results<Ok<EbcedResult>, BadRequest<ErrorResponse>, ProblemHttpResult> 
    (EbcedRequest request, EbcedService service) =>
{
    if (string.IsNullOrWhiteSpace(request.Text))
        return TypedResults.BadRequest(new ErrorResponse("Metin boş olamaz"));

    if (request.Text.Length > 10000)
        return TypedResults.BadRequest(new ErrorResponse("Metin çok uzun (maksimum 10.000 karakter)"));

    try
    {
        var result = service.Calculate(request.Text);
        return TypedResults.Ok(result);
    }
    catch (Exception ex)
    {
        return TypedResults.Problem(
            detail: app.Environment.IsDevelopment() ? ex.Message : "Bir hata oluştu",
            statusCode: 500
        );
    }
})
.WithName("CalculateEbced");

// Yeni Numerology API (tüm alfabeler)
var numApi = app.MapGroup("/api/numerology")
    .WithTags("Numerology Calculator");

numApi.MapPost("/", Results<Ok<CalculationResult>, BadRequest<ErrorResponse>, ProblemHttpResult>
    (CalculationRequest request, NumerologyService service) =>
{
    if (string.IsNullOrWhiteSpace(request.Text))
        return TypedResults.BadRequest(new ErrorResponse("Metin boş olamaz"));

    if (request.Text.Length > 10000)
        return TypedResults.BadRequest(new ErrorResponse("Metin çok uzun (maksimum 10.000 karakter)"));

    try
    {
        var result = service.Calculate(request.Text, request.Alphabet);
        return TypedResults.Ok(result);
    }
    catch (Exception ex)
    {
        return TypedResults.Problem(
            detail: app.Environment.IsDevelopment() ? ex.Message : "Bir hata oluştu",
            statusCode: 500
        );
    }
})
.WithName("CalculateNumerology");

app.Run();