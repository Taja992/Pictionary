using AutoMapper;
using Api.Rest.DTOs.Game;
using Api.Rest.DTOs.User;
using Core.Domain.Entities;

namespace Api.Rest.Mapping;

public class AutoMapperProfile : Profile
{
    public AutoMapperProfile()
    {
        CreateMap<Game, GameDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.Scores, opt => opt.MapFrom(src => 
                src.Scores
                    .GroupBy(s => s.UserId)
                    .Select(g => new ScoreDto
                    {
                        UserId = g.Key,
                        Username = g.First().User.Username,
                        Points = g.Sum(s => s.Points)
                    })
                    .ToList()
            ));
        
        CreateMap<User, UserDto>();
    }
}