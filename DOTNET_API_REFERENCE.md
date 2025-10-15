# .NET Backend API Reference

This document provides example C# code showing how to structure your .NET API to work with this React frontend.

## Program.cs Setup

```csharp
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });

// Configure CORS for frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// IMPORTANT: CORS must be before Authentication
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
```

## appsettings.json

```json
{
  "Jwt": {
    "Key": "your-super-secret-key-min-32-characters-long",
    "Issuer": "YourAppName",
    "Audience": "YourAppName",
    "ExpiresInDays": 7
  },
  "Stripe": {
    "SecretKey": "sk_test_...",
    "WebhookSecret": "whsec_..."
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

## Authentication Controller

**Controllers/AuthController.cs:**

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace YourApp.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public AuthController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    // POST api/auth/login
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        // TODO: Validate credentials against your database
        // This is a simplified example
        
        if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
        {
            return BadRequest(new { message = "Email and password are required" });
        }

        // TODO: Verify password hash
        // var user = _userService.ValidateUser(request.Email, request.Password);
        // if (user == null) return Unauthorized(new { message = "Invalid credentials" });

        // For demo purposes, creating a mock user
        var user = new User
        {
            Id = Guid.NewGuid().ToString(),
            Email = request.Email,
            Name = request.Email.Split('@')[0]
        };

        var token = GenerateJwtToken(user);

        return Ok(new
        {
            token,
            user = new
            {
                id = user.Id,
                email = user.Email,
                name = user.Name
            }
        });
    }

    // POST api/auth/signup
    [HttpPost("signup")]
    public IActionResult SignUp([FromBody] SignUpRequest request)
    {
        if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
        {
            return BadRequest(new { message = "Email and password are required" });
        }

        // TODO: Validate email format, password strength
        // TODO: Check if user already exists
        // TODO: Hash password and store in database

        var user = new User
        {
            Id = Guid.NewGuid().ToString(),
            Email = request.Email,
            Name = request.Name ?? request.Email.Split('@')[0]
        };

        var token = GenerateJwtToken(user);

        return Ok(new
        {
            token,
            user = new
            {
                id = user.Id,
                email = user.Email,
                name = user.Name
            }
        });
    }

    private string GenerateJwtToken(User user)
    {
        var securityKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("name", user.Name),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddDays(
                int.Parse(_configuration["Jwt:ExpiresInDays"])),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

// Request Models
public class LoginRequest
{
    public string Email { get; set; }
    public string Password { get; set; }
}

public class SignUpRequest
{
    public string Email { get; set; }
    public string Password { get; set; }
    public string? Name { get; set; }
}

// User Model (simplified)
public class User
{
    public string Id { get; set; }
    public string Email { get; set; }
    public string Name { get; set; }
}
```

## Experiences Controller

**Controllers/ExperiencesController.cs:**

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace YourApp.Controllers;

[ApiController]
[Route("api/experiences")]
public class ExperiencesController : ControllerBase
{
    // GET api/experiences
    [HttpGet]
    public IActionResult GetAll()
    {
        // TODO: Fetch from database
        var experiences = new List<Experience>
        {
            new Experience
            {
                Id = "1",
                Title = "Bali Wellness Retreat",
                Description = "A transformative wellness experience",
                Location = "Ubud, Bali",
                Date = "2024-03-15",
                Image = "/images/bali-retreat.jpg",
                HostName = "Sarah Johnson",
                Price = 150000, // in cents ($1,500)
                Category = "Wellness",
                Tags = new[] { "yoga", "meditation", "wellness" }
            }
        };

        return Ok(experiences);
    }

    // GET api/experiences/{id}
    [HttpGet("{id}")]
    public IActionResult GetById(string id)
    {
        // TODO: Fetch from database
        var experience = new Experience
        {
            Id = id,
            Title = "Bali Wellness Retreat",
            Description = "A transformative wellness experience",
            Location = "Ubud, Bali",
            Date = "2024-03-15",
            Image = "/images/bali-retreat.jpg",
            HostName = "Sarah Johnson",
            Price = 150000,
            Category = "Wellness",
            Tags = new[] { "yoga", "meditation", "wellness" }
        };

        return Ok(experience);
    }

    // GET api/experiences/search?q=yoga
    [HttpGet("search")]
    public IActionResult Search([FromQuery] string q)
    {
        // TODO: Implement search in database
        var results = new List<Experience>();
        return Ok(results);
    }

    // POST api/experiences
    [Authorize]
    [HttpPost]
    public IActionResult Create([FromBody] CreateExperienceRequest request)
    {
        // TODO: Validate and save to database
        var experience = new Experience
        {
            Id = Guid.NewGuid().ToString(),
            Title = request.Title,
            Description = request.Description,
            Location = request.Location,
            Date = request.Date,
            Image = request.Image,
            Price = request.Price,
            Category = request.Category,
            Tags = request.Tags
        };

        return CreatedAtAction(nameof(GetById), new { id = experience.Id }, experience);
    }

    // PUT api/experiences/{id}
    [Authorize]
    [HttpPut("{id}")]
    public IActionResult Update(string id, [FromBody] CreateExperienceRequest request)
    {
        // TODO: Update in database
        return Ok(new { message = "Updated successfully" });
    }

    // DELETE api/experiences/{id}
    [Authorize]
    [HttpDelete("{id}")]
    public IActionResult Delete(string id)
    {
        // TODO: Delete from database
        return NoContent();
    }

    // POST api/experiences/{id}/image
    [Authorize]
    [HttpPost("{id}/image")]
    public async Task<IActionResult> UploadImage(string id, IFormFile image)
    {
        if (image == null || image.Length == 0)
        {
            return BadRequest(new { message = "No file uploaded" });
        }

        // TODO: Save file to storage (Azure Blob, AWS S3, local filesystem)
        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
        var imageUrl = $"/images/{fileName}";

        return Ok(new { imageUrl });
    }
}

// Models
public class Experience
{
    public string Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public string Location { get; set; }
    public string Date { get; set; }
    public string Image { get; set; }
    public string HostName { get; set; }
    public int? Price { get; set; }
    public string Category { get; set; }
    public string[] Tags { get; set; }
}

public class CreateExperienceRequest
{
    public string Title { get; set; }
    public string Description { get; set; }
    public string Location { get; set; }
    public string Date { get; set; }
    public string? Image { get; set; }
    public int? Price { get; set; }
    public string? Category { get; set; }
    public string[]? Tags { get; set; }
}
```

## Payments Controller (Stripe)

**Controllers/PaymentsController.cs:**

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stripe;
using Stripe.Checkout;

namespace YourApp.Controllers;

[ApiController]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public PaymentsController(IConfiguration configuration)
    {
        _configuration = configuration;
        StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];
    }

    // GET api/connect/status
    [HttpGet("api/connect/status")]
    public async Task<IActionResult> GetStripeStatus()
    {
        try
        {
            // TODO: Get Stripe account ID from current user
            var accountId = "acct_xxx"; // Replace with actual account ID
            
            var accountService = new AccountService();
            var account = await accountService.GetAsync(accountId);

            return Ok(new
            {
                charges_enabled = account.ChargesEnabled,
                payouts_enabled = account.PayoutsEnabled,
                details_submitted = account.DetailsSubmitted
            });
        }
        catch (Exception ex)
        {
            return Ok(new
            {
                charges_enabled = false,
                payouts_enabled = false,
                details_submitted = false
            });
        }
    }

    // POST api/connect/account-link
    [HttpPost("api/connect/account-link")]
    public async Task<IActionResult> CreateAccountLink()
    {
        try
        {
            // TODO: Create or get Stripe Connect account for user
            var accountService = new AccountService();
            var account = await accountService.CreateAsync(new AccountCreateOptions
            {
                Type = "express",
                Email = User.FindFirst("email")?.Value,
                Capabilities = new AccountCapabilitiesOptions
                {
                    CardPayments = new AccountCapabilitiesCardPaymentsOptions
                    {
                        Requested = true,
                    },
                    Transfers = new AccountCapabilitiesTransfersOptions
                    {
                        Requested = true,
                    },
                },
            });

            var linkService = new AccountLinkService();
            var link = await linkService.CreateAsync(new AccountLinkCreateOptions
            {
                Account = account.Id,
                RefreshUrl = "http://localhost:3000/account",
                ReturnUrl = "http://localhost:3000/account",
                Type = "account_onboarding",
            });

            return Ok(new { onboarding_url = link.Url });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // POST api/checkout/session
    [HttpPost("api/checkout/session")]
    public async Task<IActionResult> CreateCheckoutSession(
        [FromBody] CheckoutRequest request)
    {
        try
        {
            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            Currency = "usd",
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = "Experience Ticket", // TODO: Get from DB
                            },
                            UnitAmount = 150000, // TODO: Get from DB
                        },
                        Quantity = 1,
                    },
                },
                Mode = "payment",
                SuccessUrl = $"http://localhost:3000/checkout/success?session_id={{CHECKOUT_SESSION_ID}}",
                CancelUrl = $"http://localhost:3000/experiences/{request.ExperienceId}",
                Metadata = new Dictionary<string, string>
                {
                    { "experience_id", request.ExperienceId },
                    { "tier_id", request.TierId }
                }
            };

            var service = new SessionService();
            var session = await service.CreateAsync(options);

            return Ok(new
            {
                sessionId = session.Id,
                url = session.Url
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET api/checkout/verify/{sessionId}
    [HttpGet("api/checkout/verify/{sessionId}")]
    public async Task<IActionResult> VerifyCheckout(string sessionId)
    {
        try
        {
            var service = new SessionService();
            var session = await service.GetAsync(sessionId);

            // TODO: Save order to database if payment succeeded
            
            return Ok(new
            {
                status = session.PaymentStatus,
                experienceId = session.Metadata["experience_id"],
                tierId = session.Metadata["tier_id"]
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public class CheckoutRequest
{
    public string ExperienceId { get; set; }
    public string TierId { get; set; }
}
```

## Required NuGet Packages

```bash
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package Stripe.net
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Microsoft.EntityFrameworkCore.SqlServer  # or your DB provider
```

## Project Structure

```
YourApp/
├── Controllers/
│   ├── AuthController.cs
│   ├── ExperiencesController.cs
│   └── PaymentsController.cs
├── Models/
│   ├── User.cs
│   ├── Experience.cs
│   └── ...
├── Services/
│   ├── IUserService.cs
│   ├── UserService.cs
│   └── ...
├── Data/
│   └── ApplicationDbContext.cs
├── appsettings.json
└── Program.cs
```

## Testing Your API

### Using Swagger
1. Run your API: `dotnet run`
2. Open: `https://localhost:7183/swagger/index.html`
3. Test endpoints directly in the Swagger UI

### Using the Frontend
1. Start backend: `dotnet run`
2. Start frontend: `npm run dev`
3. Use the React app to test the integration

## Next Steps

1. **Set up database**: Configure Entity Framework with your preferred database
2. **Implement password hashing**: Use BCrypt or similar
3. **Add validation**: Use FluentValidation or Data Annotations
4. **Implement Stripe**: Get Stripe API keys and configure webhooks
5. **Add logging**: Use Serilog or built-in logging
6. **Error handling**: Create global exception handler middleware

---

This reference provides a solid foundation for your .NET backend. Customize it based on your specific requirements!

